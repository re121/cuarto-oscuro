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

## Next steps with Kiro
Remaining tasks in `tasks.md` (for example, a split-grade printing mode) are to be
implemented through Kiro CLI against these specs.
