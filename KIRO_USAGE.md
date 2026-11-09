# How Kiro was used — Cuarto Oscuro

## Honest summary
The app prototype (`src/index.html`) was built with an AI assistant outside Kiro.
Kiro (Kiro CLI 3.0, on macOS 12, where the Kiro IDE does not run) was used for the
spec-driven side of the project:

- **Specs** — `.kiro/specs/darkroom-develop/`: Kiro CLI read the implemented app and
  rewrote `requirements.md` (EARS format), `design.md` (tone model and rendering
  pipeline) and `tasks.md` (checklist linked to requirements) so the specs match
  what was actually built. An earlier contact-sheet spec for a feature that was
  never built was removed.
- **Steering** — `.kiro/steering/structure.md` and `tech.md` were updated by Kiro to
  describe the real single-file architecture (Canvas 2D + Web Audio, no build, no server).
- **Hooks** — `.kiro/hooks/` contains a test-on-save hook and a UI-copy review hook
  from the initial scaffold.

## Feature built with Kiro: split-grade printing
Split-grade printing (two exposures: soft/yellow filter for highlights, hard/magenta
filter for shadows) was built end-to-end with Kiro CLI using spec-driven development:
1. Kiro added the new EARS requirements to `requirements.md`.
2. Kiro wrote the "Split-grade" section of `design.md` (combined soft-curve and
   hard-curve exposure model).
3. Kiro added the linked tasks to `tasks.md`.
4. Kiro implemented the feature in `src/index.html` (toggle, two time sliders,
   combined preview and develop, two-phase timer showing the active filter) and
   checked the tasks off.
The feature was then tested by hand in the browser (both modes, no console errors).

## Feature built with Kiro: test strip
A test strip renders the same negative at 5 stepped exposure times (3, 6, 9, 12, 15 s)
as vertical bands, so the printer can pick the best time before committing to a full
exposure. Built end-to-end with Kiro CLI using spec-driven development:
1. Kiro added EARS requirements 35–42 to `requirements.md`.
2. Kiro wrote the "Test strip" section of `design.md` (band layout, per-band density
   formula, label rendering, and click-to-set logic for both standard and split-grade
   modes).
3. Kiro added the linked tasks to `tasks.md`.
4. Kiro exported `testStripTimes` and `testStripBandWidth()` from `src/develop.js` and
   added two new Node tests in `tests/develop.test.js` (all 4 tests pass).
5. Kiro implemented the feature in `src/index.html`:
   - "Tira de prueba" button in the compose btn-row, disabled until an image is loaded.
   - `drawTestStrip()` divides the 460 × 560 canvas into 5 × 92 px bands, runs the
     full density model (standard or split-grade) at t = 3, 6, 9, 12, 15 s with the
     current mask and grain, draws centred time labels with shadow for legibility, and
     installs a one-shot click listener.
   - Clicking a band sets the exposure (or scales split-grade times proportionally) and
     restores the live compose preview.
6. All tasks checked off in `tasks.md`. Committed.

## Feature built with Kiro: help modal
A "¿Cómo funciona?" button in the saferow opens a `<dialog>` modal with a
beginner-friendly Spanish manual of the five darkroom steps. An in-modal toggle
switches to English. Built with Kiro CLI using spec-driven development:
1. Kiro added EARS requirements 43–52 to `requirements.md`.
2. Kiro wrote the "Help modal" section of `design.md` (dialog structure, content
   data objects, render algorithm, open/close logic, CSS, language toggle, latent hint).
3. Kiro added the linked tasks to `tasks.md`.
4. Kiro exported `HELP_STEP_COUNT` from `src/develop.js` and added one new Node test
   in `tests/develop.test.js` (all 5 tests pass).
5. Kiro implemented the feature in `src/index.html`:
   - CSS for the dialog, header, scrollable body, step sections, and extras heading;
     `body.lit` overrides included.
   - `<dialog id="helpDialog">` with native focus-trap and Escape-to-close via
     `showModal()` / `close()`.
   - `HELP_ES` and `HELP_EN` content objects with five steps plus Test strip and
     Split-grade extras in each language.
   - `renderHelp(lang)`, `openHelp()`, `closeHelp()`; backdrop click closes;
     language toggle swaps title, button label, and re-renders body.
   - "¿Cómo funciona?" trigger added to the saferow (always visible).
   - Latent status hint updated to "La imagen está latente: pulsa Revelar."
6. All tasks checked off in `tasks.md`. Committed.

## Feature built with Kiro: Zone System overlay
Ansel Adams' Zone System reading overlaid on the compose preview. The zone map colours each pixel by its predicted print density quantised into 11 zones (0 = absolute black → X = absolute white), using the same density model as the develop step (exposure, grade or split-grade, dodge/burn mask). Built end-to-end with Kiro CLI using spec-driven development:
1. Kiro added EARS requirements 67–80 to `requirements.md`.
2. Kiro wrote the "Zone System overlay" section of `design.md` (density-to-zone mapping, false-colour palette, legend, histogram, tip, eyedropper, live update wiring).
3. Kiro added the linked tasks to `tasks.md`.
4. Kiro exported `densityToZone()` and `zoneHistogram()` from `src/develop.js` and added 11 new Node tests in `tests/develop.test.js` (all 17 tests pass).
5. Kiro implemented the feature in `src/index.html`:
   - CSS for `.zone-legend`, `.zone-swatch`, `.zone-hist`, `.zone-bar-wrap`, `.zone-bar`, `.zone-bar-label`, `.zone-tip`.
   - `<div id="zoneLegend">`, `<div id="zoneHist">`, `<div id="zoneTip">` below the canvas; `<button id="zonas">` in the rail below the dodge/burn tools.
   - `ZONE_PALETTE`, `ZONE_ROMAN`, `ZONE_ES_DESC`, `ZONE_EN_DESC` constants.
   - `computeZoneDensities()`, `drawZoneMap()`, `drawZoneLegend()`, `updateZoneHistogram()`, `updateZoneTip()`, `hideZoneUI()` functions.
   - Persistent `onZoneClick` eyedropper listener (active while zone mode is on).
   - `setStep()` updated: enables Zonas only in compose state, auto-deactivates zone mode on state transitions.
   - All density-changing sliders (`#exposure`, `#contrast`, `#softTime`, `#hardTime`) and `paintAt()` call `drawZoneMap()` instead of `drawPreview()` when zone mode is active.
   - Zone mode auto-deactivates on `reset()`, `selectFrame()`, and `drawTestStrip()`.
   - "Sistema de zonas" / "Zone System" section added to `HELP_ES.extras` and `HELP_EN.extras`.
   - All existing features unchanged.
6. All tasks checked off in `tasks.md`. Committed.


A vertical 35mm film strip column sits to the left of the enlarger (horizontal
above it on narrow screens). Each loaded image appears as an inverted negative
thumbnail on a dark orange-brown film base with sprocket holes and a yellow frame
label. Clicking a frame instantly loads it into the enlarger; a × button removes it.
The file input now accepts multiple files at once. Built with Kiro CLI:
1. Kiro added EARS requirements 53–66 to `requirements.md`.
2. Kiro wrote the "Film strip negative carrier" section of `design.md` (grid layout,
   CSS, frame data model, paintThumb algorithm, addFrame/selectFrame/removeFrame/
   decodeAndAdd logic, multi-file input handler).
3. Kiro added the linked tasks to `tasks.md`.
4. Kiro exported `filmStripLabel` from `src/develop.js` and added one new Node test
   (all 6 tests pass).
5. Kiro implemented the feature in `src/index.html`:
   - `.outer-grid` wraps `.filmstrip` + existing `.studio`; responsive at 780 px.
   - `paintThumb`: nearest-neighbour downsample + invert to 44×34 canvas.
   - `addFrame / selectFrame / removeFrame / decodeAndAdd` functions.
   - Multi-file `#file` change handler; startup default negative via `decodeAndAdd`.
   - `selectFrame` uses pre-decoded rawData directly (no double decode).
   - All existing features unchanged.
6. All tasks checked off in `tasks.md`. Committed.
