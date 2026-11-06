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
