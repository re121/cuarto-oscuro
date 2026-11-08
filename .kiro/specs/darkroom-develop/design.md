# Design: Cuarto Oscuro rendering pipeline

All logic lives in `src/index.html` as inline JavaScript. No build step, no modules.

## Data model

```
rawGray : Float32Array[W×H]   // per-pixel luminance [0,1] from loaded image
mask    : Float32Array[W×H]   // dodge/burn multiplier; 1.0 = untouched, 0.45–1.8 range
state   : string              // compose | exposing | latent | developing | devdone | fixed
```

## Tone / contrast curve

```js
curve(v, grade) = clamp((v - 0.5) * k + 0.5, 0, 1)
  where k = 0.8 + (grade - 1) * 0.35   // grade 1→k=0.80, grade 5→k=2.20
```

An S-curve centred at 0.5. Higher grade → steeper slope → harder shadows and highlights (replicating variable-contrast paper grades 1–5).

## Exposure model

```
eN = exposureSeconds / 9          // normalise against the "ideal" 9 s
effective_exposure(p) = eN × mask[p]
final(p) = pow(curve(rawGray[p]), effective_exposure(p))
```

`eN < 1` → lighter print (underexposed); `eN > 1` → denser print (overexposed).
`mask[p] < 1` (dodge) reduces local exposure → lighter area.
`mask[p] > 1` (burn) increases local exposure → darker area.

## Shadows-first development animation

```
progress(t) = (t/dur × 1.35 − final[p] × 0.5) / 0.85   clamped [0,1]
pixel_value(t, p) = 255 × (1 − (1 − final[p]) × progress(t, p))
```

Pixels with high `final` (dense/dark) reach their target value later in the animation, so shadows and midtones emerge before the highlights — matching real developer chemistry. Duration: ~7 000 ms via `requestAnimationFrame`.

## Dodge and burn brush

Pointer events accumulate into `mask[]`. Each call to `paintAt(x, y)`:

```
for each pixel p within brush radius r:
  delta = ±0.04 × (1 − dist/r)        // radial falloff
  mask[p] = clamp(mask[p] + delta, 0.45, 1.8)
```

Dodge uses `−0.04`; burn uses `+0.04`.

## Grain

After development completes, per-pixel noise is added before display:

```
noise = (Math.random() − 0.5) × grainAmt
channel += noise   (R, G, B identically → neutral grain)
```

`grainAmt` range: 0–30. Labels: fine < 6, medium < 20, coarse ≥ 20.

## Toning (applied at fix)

| Toner    | R              | G           | B              |
|----------|----------------|-------------|----------------|
| Neutral  | v×1.03 + 4     | v           | v×0.97         |
| Sepia    | v×1.07 + 14    | v×1.00 + 6  | v×0.80         |
| Selenium | v×0.98 + 8     | v×0.96      | v×1.04 + 10    |

A white border (10 px `strokeRect`) is also drawn over the print at fix time.

## Audio

Web Audio API nodes created lazily on first user gesture:
- `clack()`: square oscillator at 180 Hz, 70 ms — enlarger click.
- `tick()`: square oscillator at 1 500 Hz, 30 ms — countdown tick.
- `waterStart/Stop()`: looped pink-noise buffer through a 650 Hz low-pass filter, gain-ramped — developer agitation.

## Canvas sizing

Canvas is fixed at 460 × 560 px. The loaded image is letterboxed (fill black) to fit, preserving aspect ratio.

## State machine transitions

```
compose  →[Expose]→  exposing  →[timer]→  latent
latent   →[Develop]→ developing →[rAF done]→ devdone
devdone  →[Fix]→     fixed
developing →[Fix]→   fixed          (early fix / stop bath)
fixed    →[Reset]→   compose
```

## Split-grade printing

Split-grade is a real darkroom technique: the print receives two separate enlarger exposures on variable-contrast (VC) paper — one through a soft (yellow) filter at grade 00, which controls highlight density with minimal shadow impact, and one through a hard (magenta) filter at grade 5, which builds shadow density with minimal highlight impact. The combined result gives the printer independent control over both tonal extremes.

### Data model additions

```
splitGrade : boolean          // false = standard single-grade mode (default)
softTime   : number (0–20 s)  // exposure through yellow / grade-00 filter
hardTime   : number (0–20 s)  // exposure through magenta / grade-5 filter
```

When `splitGrade` is false all three new variables are ignored; `grade` and `exposure` govern as before.

### Curves

```
curveSoft(v) = clamp((v − 0.5) × 0.80 + 0.5, 0, 1)   // grade 00: k = 0.80
curveHard(v) = clamp((v − 0.5) × 2.20 + 0.5, 0, 1)   // grade  5: k = 2.20
```

These are fixed grades (not user-adjustable) matching the extreme ends of the VC paper scale.

### Combined density model

```
eNsoft = softTime / 9
eNhard = hardTime / 9
final(p) = pow(curveSoft(raw[p]), eNsoft × mask[p])
         × pow(curveHard(raw[p]), eNhard × mask[p])
```

The multiplication of two power-law terms is equivalent to adding the log-densities from each filter stage — matching the chemistry of sequential exposures on VC paper. When `eNsoft = 0` the soft term equals 1 (no effect); when `eNhard = 0` the hard term equals 1. The combined result is clamped to [0, 1] before rendering.

### Expose sequence

1. Fill canvas paper-white; play click.
2. **Soft phase** (duration = `softTime` s): canvas tinted yellow (`rgba(255,210,0,.18)`); timer shows `"Amarillo · Ns"`.
3. On soft-phase end: play click; clear tint.
4. **Hard phase** (duration = `hardTime` s): canvas tinted magenta (`rgba(200,0,180,.14)`); timer shows `"Magenta · Ns"`.
5. On hard-phase end: play click; transition to `latent`.

If either time is 0 its phase is skipped silently. If both are 0 the Expose button remains active but the expose function warns via the status line.

### Preview

`drawPreview()` branches on `splitGrade`: when true it uses the combined density formula above, scaled to the preview brightness range. The compose preview updates live as either slider changes.

### UI

- A toggle button (`.btn`, `aria-pressed`) labelled **"Gradación dividida"** placed immediately below the grade slider row.
- When pressed: hide the grade-slider `<div>` (`display:none`), show the split-grade `<div>` containing the two range inputs (`id="softTime"` / `id="hardTime"`).
- When released: reverse. Grade slider and standard model are restored.
- Labels: **"Suave (amarillo) · N s"** and **"Duro (magenta) · N s"** following the existing label style.

## Test strip

A test strip is a darkroom tool: one sheet of paper receives several stepped exposures (each band covered after its allotted time) so the printer can pick the best time before burning a full sheet. This implementation simulates all five bands simultaneously using the exposure model.

### Band layout

```
Canvas 460 × 560 px divided into 5 equal vertical bands:
  band 0: x = 0   … 91   → 3 s
  band 1: x = 92  … 183  → 6 s
  band 2: x = 184 … 275  → 9 s
  band 3: x = 276 … 367  → 12 s
  band 4: x = 368 … 459  → 15 s
  (bandWidth = Math.floor(W / 5))
```

### Density per band

For each band `i` with exposure time `t = [3, 6, 9, 12, 15][i]`:

```
// Standard mode
eN = t / 9
final(p) = pow(curve(rawGray[p]), eN × mask[p])

// Split-grade mode
ratio = softTime / (softTime + hardTime)   // default 0.5 if both 0
tSoft  = t × ratio
tHard  = t × (1 − ratio)
eNs = tSoft / 9,  eNh = tHard / 9
final(p) = pow(curveSoft(raw[p]), eNs × mask[p]) × pow(curveHard(raw[p]), eNh × mask[p])
```

Grain is applied once to the full image after all bands are drawn (same `applyGrain()` call used in development).

### Labels

Each band's label ("3s" … "15s") is drawn centred horizontally in the band and 18 px from the top:

```
ctx.font = '500 13px "IBM Plex Mono", monospace'
ctx.fillStyle = 'rgba(255,255,255,0.85)'
ctx.textAlign = 'center'
ctx.fillText(label, bandX + bandWidth/2, 18)
```

A subtle dark drop-shadow (`ctx.shadowBlur = 3, shadowColor = 'rgba(0,0,0,.8)'`) ensures the label is legible over light highlights.

### Click-to-set

A one-shot `'click'` listener on `#paper` maps the pointer's canvas-relative X coordinate to a band index:

```
bandIndex = Math.floor(canvasX / bandWidth)   clamped [0, 4]
pickedTime = [3, 6, 9, 12, 15][bandIndex]
```

**Standard mode:** `exposure = pickedTime`; update the `#exposure` slider and its value display.

**Split-grade mode:**
```
ratio = softTime / (softTime + hardTime)   // or 0.5 if both are 0
softTime = Math.round(pickedTime × ratio)
hardTime = pickedTime − softTime
```
Update `#softTime`, `#hardTime`, and their value displays.

After the click: remove the one-shot listener, call `drawPreview()` to restore the compose view.

### UI

- Button: `<button class="btn" id="testStrip" disabled>Tira de prueba</button>`, placed in the workflow btn-row alongside Expose.
- Enabled only in `compose` state when `rawGray` is not null (same gating as Expose).
- `setStep()` applies the same disabled logic as the Expose button.

## Help modal

### Structure

A `<dialog id="helpDialog">` element is used for the modal. `<dialog>` provides native focus-trapping and `Escape`-to-close on modern browsers. A polyfill is not needed: the app already requires a modern Canvas 2D + Web Audio environment.

```html
<dialog id="helpDialog" class="help-dialog" aria-labelledby="helpTitle">
  <div class="help-inner">
    <div class="help-header">
      <span id="helpTitle" class="help-title">¿Cómo funciona?</span>
      <div class="help-header-actions">
        <button class="btn help-lang" id="helpLang">English</button>
        <button class="btn help-close" id="helpClose" aria-label="Cerrar">✕</button>
      </div>
    </div>
    <div class="help-body" id="helpBody"><!-- filled by JS --></div>
  </div>
</dialog>
```

### Content data

Two objects (`HELP_ES`, `HELP_EN`) hold the full text. Each has:
- `title`: dialog heading string
- `steps`: array of `{heading, text}` for the five workflow steps
- `extras`: array of `{heading, text}` for Test strip and Split-grade

```js
const HELP_ES = {
  title: '¿Cómo funciona?',
  langToggle: 'English',
  steps: [
    { heading: '1 · Componer',
      text: 'Carga un negativo con el botón "Cargar imagen".\nAjusta el tiempo de exposición (2–20 s) y el contraste (grado 1–5).\nUsa las herramientas Reservar y Quemar para aclarar u oscurecer zonas con el pincel.' },
    { heading: '2 · Exponer',
      text: 'Pulsa Exponer. La ampliadora proyecta la luz sobre el papel.\nEl papel queda en blanco: la imagen es latente e invisible hasta que se revela. Eso es normal.' },
    { heading: '3 · Revelar',
      text: 'Pulsa Revelar. El papel entra en el revelador.\nLas sombras aparecen primero; las luces llegan después. Así funciona la química real.' },
    { heading: '4 · Parar + Fijar',
      text: 'Pulsa Parar + Fijar para detener el revelado y fijar la copia.\nElige el virado (Neutro, Sepia o Selenio) antes de fijar para cambiar el tono de la copia.' },
    { heading: '5 · Descargar copia',
      text: 'Cuando la copia esté fijada, pulsa Descargar copia para guardarla como PNG.' },
  ],
  extras: [
    { heading: 'Tira de prueba',
      text: 'Pulsa "Tira de prueba" antes de exponer. Verás cinco bandas con tiempos de 3, 6, 9, 12 y 15 s.\nHaz clic en la banda que más te guste para usar ese tiempo.' },
    { heading: 'Gradación dividida',
      text: 'Activa "Gradación dividida" para controlar las luces y las sombras por separado.\nEl filtro amarillo (suave) controla las luces; el magenta (duro) construye las sombras.' },
  ],
};

const HELP_EN = {
  title: 'How does it work?',
  langToggle: 'Español',
  steps: [
    { heading: '1 · Compose',
      text: 'Load a negative with "Cargar imagen".\nSet the exposure time (2–20 s) and contrast grade (1–5).\nUse the Dodge and Burn brushes to lighten or darken specific areas.' },
    { heading: '2 · Expose',
      text: 'Click Expose. The enlarger shines light onto the paper.\nThe paper stays white — the image is latent and invisible until developed. This is normal.' },
    { heading: '3 · Develop',
      text: 'Click Develop. The paper goes into the developer tray.\nShadows appear first; highlights follow. That is how real darkroom chemistry works.' },
    { heading: '4 · Stop + Fix',
      text: 'Click Stop + Fix to halt development and fix the print.\nChoose a toner (Neutral, Sepia or Selenium) before fixing to change the print\'s colour.' },
    { heading: '5 · Download print',
      text: 'Once the print is fixed, click Download to save it as a PNG file.' },
  ],
  extras: [
    { heading: 'Test strip',
      text: 'Click "Tira de prueba" before exposing. Five bands are shown at 3, 6, 9, 12 and 15 s.\nClick the band you like to set that exposure time.' },
    { heading: 'Split-grade printing',
      text: 'Enable "Gradación dividida" to control highlights and shadows independently.\nThe yellow (soft) filter controls highlights; the magenta (hard) filter builds shadows.' },
  ],
};
```

### Rendering

`renderHelp(lang)` builds the `#helpBody` innerHTML from the active content object:
- Each step is a `<section class="help-step">` with `<h3>` heading and `<p>` text (newlines → `<br>`).
- Extras section starts with a `<h3 class="help-extras-heading">` separator then the same `<section>` pattern.

### Open / close

```js
function openHelp() { $('#helpDialog').showModal(); }
function closeHelp() { $('#helpDialog').close(); }
$('#helpDialog').addEventListener('click', e => { if (e.target === $('#helpDialog')) closeHelp(); });
```

`showModal()` natively traps focus and handles Escape.

### Language toggle

```js
let helpLang = 'es';
$('#helpLang').onclick = () => {
  helpLang = helpLang === 'es' ? 'en' : 'es';
  const data = helpLang === 'es' ? HELP_ES : HELP_EN;
  $('#helpTitle').textContent = data.title;
  $('#helpLang').textContent = data.langToggle;
  renderHelp(helpLang);
};
```

### CSS

```css
.help-dialog {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--ink);
  max-width: min(540px, 94vw);
  max-height: 80vh;
  padding: 0;
  overflow: hidden;
}
.help-dialog::backdrop { background: rgba(0,0,0,.72); }
.help-inner { display: flex; flex-direction: column; height: 100%; }
.help-header { display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-bottom: 1px solid var(--line); }
.help-title { font-family: var(--display); font-size: 1.15rem; color: #f3e7df; }
.help-header-actions { display: flex; gap: 8px; }
.help-lang { padding: 5px 10px; font-size: .7rem; }
.help-close { padding: 5px 10px; font-size: .85rem; }
.help-body { overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.help-step h3 { font-family: var(--display); font-size: 1rem; color: var(--safe); margin: 0 0 4px; }
.help-step p { margin: 0; font-size: .82rem; line-height: 1.6; color: var(--ink); }
.help-extras-heading { font-size: .7rem; letter-spacing: .2em; text-transform: uppercase;
  color: var(--muted); margin: 4px 0 2px; }
```

### Latent-state hint

In `setStep()`, when `state === 'latent'`, the status line text is overridden to:
`"La imagen está latente: pulsa Revelar."` (replacing the existing generic latent text).

## Film strip negative carrier

### Layout

The page grid gains a third column to the left of `.studio`:

```
.outer-grid
  .filmstrip          ← new, left column (wide screens)
  .studio             ← existing (bench + rail)
```

```css
/* Wide: filmstrip left, then studio */
.outer-grid {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 16px;
  align-items: start;
}
/* Narrow: filmstrip above studio */
@media (max-width: 780px) {
  .outer-grid { grid-template-columns: 1fr; }
}
```

The existing `.studio` grid (`1fr 310px`) remains unchanged inside `.outer-grid`.

### Film strip container

```html
<div class="filmstrip" id="filmstrip">
  <!-- .fs-frame elements injected by JS -->
</div>
```

```css
.filmstrip {
  width: 68px;
  background: #3d1f0a;           /* dark orange-brown film base */
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 8px 0;
  overflow-y: auto;
  max-height: calc(560px + 32px); /* canvas H + tray padding */
  position: sticky;
  top: 16px;
}
@media (max-width: 780px) {
  .filmstrip {
    width: 100%;
    max-height: none;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 8px;
    position: static;
  }
}
```

### Frame element

Each frame is a `.fs-frame` element:

```html
<div class="fs-frame" data-idx="0">
  <div class="fs-sprockets">  <!-- top sprockets row -->
    <span class="fs-hole"></span><span class="fs-hole"></span>
  </div>
  <div class="fs-thumb-wrap">
    <canvas class="fs-thumb" width="44" height="34"></canvas>
    <button class="fs-remove" aria-label="Eliminar fotograma">×</button>
  </div>
  <div class="fs-label">1A</div>
  <div class="fs-sprockets">  <!-- bottom sprockets row -->
    <span class="fs-hole"></span><span class="fs-hole"></span>
  </div>
</div>
```

```css
.fs-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2px 0;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}
.fs-frame.active .fs-thumb-wrap { outline: 2px solid #e03a2a; border-radius: 3px; }
.fs-sprockets { display: flex; justify-content: space-around; width: 100%; padding: 1px 4px; }
.fs-hole {
  display: block; width: 8px; height: 6px;
  background: #1a0a04; border-radius: 2px;
}
.fs-thumb-wrap { position: relative; }
.fs-thumb { display: block; border-radius: 2px; }
.fs-remove {
  display: none; position: absolute; top: 1px; right: 1px;
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(224,58,42,.85); border: none;
  color: #fff; font-size: 9px; line-height: 1;
  cursor: pointer; padding: 0;
}
.fs-frame.active .fs-remove { display: flex; align-items: center; justify-content: center; }
.fs-label {
  font-family: var(--mono); font-size: 8px; color: #d4a017;
  letter-spacing: .05em; margin: 1px 0;
}
/* Horizontal (narrow) */
@media (max-width: 780px) {
  .fs-frame { flex-direction: row; width: auto; padding: 0 2px; height: 68px; }
  .fs-sprockets { flex-direction: column; width: auto; height: 100%; padding: 4px 1px; }
  .fs-hole { width: 6px; height: 8px; }
  .fs-label { writing-mode: vertical-rl; margin: 0 1px; }
}
```

### Thumbnail rendering

Each frame's thumbnail is painted once when the frame is added, using a small off-screen canvas:

```js
function paintThumb(thumbCanvas, rawData, imgW, imgH) {
  const tw = thumbCanvas.width, th = thumbCanvas.height;
  const tctx = thumbCanvas.getContext('2d');
  const im = tctx.createImageData(tw, th);
  for (let ty = 0; ty < th; ty++) {
    for (let tx = 0; tx < tw; tx++) {
      // sample rawData (Float32Array[imgW×imgH]) with nearest-neighbour
      const sx = Math.floor(tx * imgW / tw);
      const sy = Math.floor(ty * imgH / th);
      const raw = rawData[sy * imgW + sx];
      // invert: negative appearance
      const v = Math.round((1 - raw) * 255);
      const i = (ty * tw + tx) * 4;
      im.data[i] = im.data[i+1] = im.data[i+2] = v; im.data[i+3] = 255;
    }
  }
  tctx.putImageData(im, 0, 0);
}
```

### Frame data model

```js
// Each entry in the `frames` array:
{
  src: string,           // original data-URL (for re-loading via loadImage)
  label: string,         // "1A", "2A", …
  rawGray: Float32Array, // full-resolution decoded pixels (W×H)
  el: HTMLElement,       // .fs-frame DOM node
}

let frames = [];          // ordered list of frames
let activeFrame = -1;     // index into frames[]
```

The built-in default negative is inserted as `frames[0]` at startup.

### Adding frames

`addFrame(src, rawData)` — called after an image is decoded:
1. Build label: `String(frames.length + 1) + 'A'`
2. Create `.fs-frame` element; paint the 44×34 thumbnail.
3. Push to `frames[]`; set as active via `selectFrame(index)`.
4. Append element to `#filmstrip`.

### Selecting a frame

`selectFrame(index)`:
1. Remove `.active` from all `.fs-frame` elements; add it to `frames[index].el`.
2. `activeFrame = index`.
3. Call the existing `loadImage(frames[index].src)` — which already resets `rawGray`, `mask`, `state`, calls `drawPreview()` and `setStep()`.

### Removing a frame

`removeFrame(index)`:
1. Remove `frames[index].el` from the DOM.
2. Splice `frames` array.
3. If `frames.length === 0`: clear canvas, set `rawGray = null`, call `setStep()`, update status.
4. Else: select `Math.max(0, index - 1)`.

### File input change handler

Replace the existing single-file handler with a multi-file loop:

```js
$('#file').addEventListener('change', e => {
  const files = [...e.target.files];
  if (!files.length) return;
  const startIdx = frames.length;
  files.forEach(f => {
    const r = new FileReader();
    r.onload = () => decodeAndAdd(r.result);
    r.readAsDataURL(f);
  });
  e.target.value = ''; // allow re-selecting same files
});
```

`decodeAndAdd(src)` draws the image onto the full-res off-screen canvas, builds `rawGray`, then calls `addFrame(src, rawGray, W, H)`.

### Label numbering

Labels are assigned at add-time as `frames.length + 1 + 'A'` (before the push). If frames are removed and then new ones added, numbering continues from the current length + 1 (not re-indexed), keeping labels stable.

### Existing file input

The `<label class="loadbtn" for="file">Cargar imagen</label>` and `<input type="file" id="file">` in the rail remain; `multiple` attribute is added to the input. The "Negativo" section of the rail is kept so the label still serves as the upload trigger.
