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