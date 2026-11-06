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
