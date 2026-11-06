# How Kiro was used — Cuarto Oscuro

## Spec-driven development

The darkroom workflow was specified before a line of code was written:

- `.kiro/specs/darkroom-develop/requirements.md` — 26 EARS-format requirements covering load, expose, develop, fix, tone, grain, safelight, sound, and export.
- `.kiro/specs/darkroom-develop/design.md` — concrete formulas for the tone curve, exposure model, shadows-first animation, dodge/burn brush, and audio approach.
- `.kiro/specs/darkroom-develop/tasks.md` — implementation checklist linked back to requirements, used to track progress during the jam.

A contact-sheet feature was specced early (`.kiro/specs/contact-sheet/`) but was cut — the single-HTML constraint made it impractical within the jam window.

## Steering

Three steering files kept Kiro's suggestions on-brand throughout:

- `steering/product.md` — audience, tone, privacy constraint (no uploads).
- `steering/structure.md` — single-file architecture; no build step; function naming conventions.
- `steering/tech.md` — Canvas 2D + Web Audio only; no framework; accessibility requirements.

These were referenced implicitly on every code-generation prompt, preventing Kiro from suggesting React, bundlers, or server calls.

## Hooks

- `hooks/test-on-save.kiro.hook` — originally intended to run the Node test-runner stub on save. The test harness was later dropped (the inline script made module isolation awkward), but the hook stayed as a reminder.
- `hooks/ui-copy-review.kiro.hook` — reviewed the Spanish-language UI strings for tone and consistency with the darkroom aesthetic.

## Code generation

Kiro generated the initial implementation of:

- The `curve()` / `develop()` / `applyGrain()` / `applyTone()` pipeline from the formulas in `design.md`.
- The `requestAnimationFrame` animation loop with the shadows-first progress formula.
- The Web Audio graph (oscillators for click/tick, pink-noise buffer for water agitation).
- The `setStep()` state machine wiring (button enable/disable, label updates).
- The responsive CSS Grid layout and `body.lit` safelight theme swap.

The single-file constraint meant every generated snippet was integrated by hand — no module boundaries — which kept the final file small (~280 lines) but required careful context management between prompts.

## What Kiro did not do

- The base64 default negative was added manually.
- Final pixel-level tuning of the exposure formula (`eN = seconds / 9`) was done by eye, not spec.
- Accessibility review (contrast ratios, `aria-pressed`) was verified manually.
