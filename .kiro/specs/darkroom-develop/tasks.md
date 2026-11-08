# Tasks: Cuarto Oscuro darkroom develop

All tasks are implemented in `src/index.html`.

## Load & preview
- [x] Load image via file input → decode, letterbox, convert to `rawGray` Float32Array (REQ 1)
- [x] Ship built-in default negative as inline base64 JPEG (REQ 2)
- [x] Draw compose preview: dim greyscale render with live contrast curve (REQ 5)

## Contrast curve
- [x] `curve(v)`: linear S-curve centred at 0.5, steepness driven by grade 1–5 (REQ 5)

## Dodge and burn
- [x] `mask[]` Float32Array initialised to 1.0 per pixel (REQ 6)
- [x] `paintAt(x, y)`: radial falloff brush writes ±0.04 delta to mask (REQ 6)
- [x] Pointer events (pointerdown / pointermove) mapped to canvas coordinates (REQ 6)
- [x] Brush size range input wired to `brush` variable (REQ 7)
- [x] Three-button tool selector: Dodge / Burn / None with `aria-pressed` (REQ 6, REQ 8)

## Expose step
- [x] `expose()`: fill canvas paper white, run `setInterval` countdown with tick sound (REQ 9)
- [x] Transition to `latent` state on countdown end (REQ 10)

## Development animation
- [x] `develop()`: compute `final[]` using exposure model and mask (REQ 11)
- [x] `requestAnimationFrame` loop, ~7 000 ms, shadows-first progress formula (REQ 11)
- [x] `waterStart()` / `waterStop()` looped pink-noise node (REQ 12)
- [x] `applyGrain()` after animation frame completes (REQ 13, REQ 14)
- [x] Exposure verdict: subexposed / good / overexposed on completion (REQ 13)

## Fixer
- [x] `fix()`: callable from `developing` or `devdone` (REQ 15, REQ 16)
- [x] Calls `applyTone()`, removes `.wet` class, stops water sound (REQ 15)

## Toning
- [x] Neutral, Sepia, Selenium channel transforms in `applyTone()` (REQ 17–19)
- [x] White 10 px border applied at fix time (REQ 17)
- [x] Three-button segment selector with `aria-pressed` (REQ 17–20)

## Grain
- [x] Grain slider (0–30) with fine / medio / grueso label (REQ 14)

## Export
- [x] `download()`: `canvas.toBlob()` → object URL → auto-click anchor → revoke (REQ 21)

## Safelight toggle
- [x] `body.lit` class swaps CSS custom properties to light scheme (REQ 22, REQ 23)

## Sound toggle
- [x] `soundOn` boolean; stops `waterNode` immediately when toggled off (REQ 24)

## State machine & UI wiring
- [x] `setStep()`: disables/enables buttons by state, updates step label and status text (REQ 25)
- [x] `reset()`: clears state, resets mask, redraws preview without reloading image (REQ 26)

## Privacy
- [x] No network requests; `FileReader` stays local; no external analytics (REQ 3)

## Split-grade printing
- [x] Add `splitGrade` boolean, `softTime` and `hardTime` variables to state (REQ 27, REQ 28)
- [x] Add split-grade toggle button (`#splitToggle`, `aria-pressed`) and split-grade slider panel to HTML (REQ 27, REQ 28)
- [x] Wire toggle: show/hide grade-slider div vs split-grade div; update `splitGrade` flag (REQ 27, REQ 28)
- [x] Wire `#softTime` and `#hardTime` range inputs to variables; refresh preview on change (REQ 32)
- [x] Implement `curveSoft` and `curveHard` fixed-grade helpers (grade 00 / grade 5) (REQ 31)
- [x] Update `drawPreview()` to use combined density model when `splitGrade` is true (REQ 32)
- [x] Update `develop()` to use combined density formula when `splitGrade` is true (REQ 31)
- [x] Update `expose()` to run soft phase (yellow tint) then hard phase (magenta tint) in sequence when `splitGrade` is true; play click between phases; skip zero-duration phases (REQ 29, REQ 30)
- [x] Show zero-time warning in status when both softTime and hardTime are 0 (REQ 33)
- [x] Verify all existing features unaffected when `splitGrade` is false (REQ 34)

## Test strip
- [x] Add `<button class="btn" id="testStrip" disabled>Tira de prueba</button>` to the HTML btn-row alongside Expose (REQ 40)
- [x] Update `setStep()` to enable `#testStrip` only in compose state when rawGray is not null (REQ 40, REQ 41)
- [x] Implement `drawTestStrip()`: divide the canvas into 5 equal vertical bands, compute final[] for each pixel using the correct exposure model (standard or split-grade) at t = 3, 6, 9, 12, 15 s with mask applied (REQ 35, REQ 36)
- [x] After drawing all bands in `drawTestStrip()`, call `applyGrain()` to add grain consistently (REQ 36)
- [x] Draw band labels ("3s"–"15s") centred at the top of each band with a readable style (REQ 37)
- [x] Attach a one-shot click listener on `#paper` that maps X coordinate → band → time, updates exposure or split-grade times, calls `drawPreview()`, and removes itself (REQ 38, REQ 39, REQ 42)
- [x] Wire `#testStrip` `onclick` to `drawTestStrip()` (REQ 35)
- [x] Add a Node test in `tests/develop.test.js` verifying that `testStripTimes` (exported from `src/develop.js`) equals `[3, 6, 9, 12, 15]` and that each band width for W=460 is `Math.floor(460/5) = 92` (REQ 35)

## Help modal
- [x] Add CSS for `.help-dialog`, `.help-inner`, `.help-header`, `.help-body`, `.help-step`, `.help-extras-heading` to the `<style>` block (REQ 43, REQ 48, REQ 49)
- [x] Add `<dialog id="helpDialog">` markup with header (title, language toggle, close button) and empty `#helpBody` div (REQ 43, REQ 47, REQ 48)
- [x] Add `HELP_ES` and `HELP_EN` content objects in the `<script>` block (REQ 44, REQ 45, REQ 46, REQ 47)
- [x] Implement `renderHelp(lang)` to build `#helpBody` innerHTML from the active content object (REQ 44, REQ 45, REQ 46)
- [x] Implement `openHelp()` / `closeHelp()` and wire backdrop-click to close (REQ 48, REQ 49)
- [x] Wire `#helpClose` onclick and `#helpLang` onclick; language toggle updates title, button label, and re-renders body (REQ 47, REQ 48)
- [x] Add `<span class="switch" id="help">¿Cómo funciona?</span>` to the saferow alongside the light and sound toggles; wire its onclick to `openHelp()` (REQ 50)
- [x] Update the `latent` entry in `setStep()`'s map to use status text "La imagen está latente: pulsa Revelar." (REQ 51)
- [x] Add a Node test in `tests/develop.test.js` verifying that `HELP_STEP_COUNT` (exported from `src/develop.js`) equals 5 (REQ 44)
