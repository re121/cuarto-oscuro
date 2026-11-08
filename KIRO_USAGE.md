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
