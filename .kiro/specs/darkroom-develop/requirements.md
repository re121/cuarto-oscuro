# Requirements: Cuarto Oscuro darkroom develop

## Load negative
1. WHEN the user selects an image file, THE SYSTEM SHALL decode it, convert it to grayscale luminance, and display a dim preview on the canvas.
2. WHEN no user image has been loaded, THE SYSTEM SHALL display the built-in default negative (Dracula, ORCHIDACEAE series) on startup.
3. THE SYSTEM SHALL never transmit image data over the network; all processing occurs in the browser.

## Exposure timer and paper grade
4. WHEN the user adjusts the Exposure slider (2–20 s), THE SYSTEM SHALL update the displayed value and use it as the enlarger timer duration.
5. WHEN the user adjusts the Contrast (grade) slider (1–5), THE SYSTEM SHALL update the S-curve steepness and refresh the compose preview immediately.

## Dodge and burn
6. WHEN a dodge or burn tool is selected and the user drags over the canvas in compose state, THE SYSTEM SHALL modify a per-pixel mask: dodge lightens (mask < 1) and burn darkens (mask > 1) with a radial falloff brush.
7. WHEN the user selects the brush size slider, THE SYSTEM SHALL change the brush radius for subsequent strokes.
8. WHEN no tool is selected (None), THE SYSTEM SHALL make pointer events on the canvas a no-op.

## Expose step
9. WHEN the user clicks Expose, THE SYSTEM SHALL fill the canvas with paper white, display a countdown timer in seconds, play an enlarger click sound, and tick each second.
10. WHEN the countdown reaches zero, THE SYSTEM SHALL play a second click, clear the timer, and transition to the latent state.

## Develop — shadows-first animation
11. WHEN the user clicks Develop, THE SYSTEM SHALL animate the image emerging on the canvas over ~7 seconds: shadows appear first, highlights follow, simulating paper in developer.
12. WHILE developing, THE SYSTEM SHALL play a looping water/agitation sound.
13. WHEN development completes, THE SYSTEM SHALL add film grain (per-pixel random noise scaled by the grain setting), stop the water sound, and display an exposure-quality verdict (subexposed / good / overexposed).

## Grain
14. WHEN the user adjusts the Grain slider (0–30), THE SYSTEM SHALL store the value and apply it as per-pixel noise amplitude at the end of development.

## Fixer / stop bath
15. WHEN the user clicks Fix, THE SYSTEM SHALL finalize the print: apply the chosen tone, remove the wet-tray highlight, stop the water sound, and transition to the fixed state.
16. THE SYSTEM SHALL allow Fix to be triggered from either developing or devdone state.

## Toning
17. WHEN the user selects Neutral toning (default), THE SYSTEM SHALL apply a slight warm shift and add a faint white border.
18. WHEN the user selects Sepia toning, THE SYSTEM SHALL apply warm brown channel shifts.
19. WHEN the user selects Selenium toning, THE SYSTEM SHALL apply a cool blue-purple channel shift.
20. Toning SHALL be applied at fix time, not during development.

## Export
21. WHEN the user clicks Download and the print is fixed, THE SYSTEM SHALL export the canvas as a PNG file named `cuarto-oscuro.png` using a temporary object URL.

## Safelight toggle
22. WHEN the user clicks "Encender la luz", THE SYSTEM SHALL switch the page to a light colour scheme and update the button label to "Apagar la luz".
23. WHEN the user clicks "Apagar la luz", THE SYSTEM SHALL restore the dark safelight colour scheme.

## Sound toggle
24. WHEN the user clicks the Sound toggle, THE SYSTEM SHALL switch sound on or off and reflect the state in the button label; stopping active water sound if turning off.

## Workflow state machine
25. THE SYSTEM SHALL enforce a linear workflow: compose → (expose) → latent → (develop) → developing → devdone → (fix) → fixed; buttons not applicable to the current state SHALL be disabled.
26. WHEN the user clicks "Nueva copia", THE SYSTEM SHALL reset to compose state, restoring the mask and preview without reloading the image.

## Split-grade printing
27. WHEN the user activates the Split-grade toggle, THE SYSTEM SHALL hide the single grade slider and reveal two independent time sliders — one for the soft exposure (grade 00, yellow filter, 0–20 s) and one for the hard exposure (grade 5, magenta filter, 0–20 s).
28. WHEN the user deactivates the Split-grade toggle, THE SYSTEM SHALL hide the two split-grade sliders and restore the single grade slider, reverting to the standard single-exposure model.
29. WHEN split-grade mode is active and the user clicks Expose, THE SYSTEM SHALL run two sequential exposures: first the soft exposure for the configured soft time (yellow safelight tint on canvas), then the hard exposure for the configured hard time (magenta tint), each announced in the timer display with the active filter colour.
30. WHEN either split-grade phase reaches zero, THE SYSTEM SHALL play the enlarger click sound and transition automatically to the next phase; after the hard phase ends it SHALL transition to the latent state.
31. WHEN split-grade mode is active, THE SYSTEM SHALL compute the final pixel density as the combination of a soft-curve exposure (grade 00, k=0.80) and a hard-curve exposure (grade 5, k=2.20), each weighted by its own normalised time (seconds ÷ 9), using the formula: final(p) = pow(curveSoft(raw[p]), eNsoft × mask[p]) × pow(curveHard(raw[p]), eNhard × mask[p]).
32. WHEN split-grade mode is active, THE SYSTEM SHALL update the compose preview in real time as either time slider changes, reflecting the combined density model.
33. WHEN split-grade mode is active and both soft time and hard time are 0, THE SYSTEM SHALL display a warning hint that the exposure time is zero.
34. THE SYSTEM SHALL preserve all existing features (dodge/burn, toning, grain, safelight, sound, export, state machine) unchanged regardless of whether split-grade mode is on or off.

## Test strip
35. WHEN the user clicks the "Tira de prueba" button in compose state with an image loaded, THE SYSTEM SHALL render the canvas as 5 equal vertical bands, each exposed at 3, 6, 9, 12 and 15 seconds respectively, using the current grade (or the combined split-grade density model if split-grade mode is active).
36. WHEN rendering the test-strip bands, THE SYSTEM SHALL apply the current dodge/burn mask and grain settings consistently across all bands.
37. WHEN the test strip is rendered, THE SYSTEM SHALL label each band with its exposure time (e.g. "3s", "6s", "9s", "12s", "15s") centred at the top of the band in a contrasting, legible style.
38. WHEN the user clicks one of the 5 rendered bands on the test-strip canvas, THE SYSTEM SHALL set the exposure slider (or, in split-grade mode, scale the soft and hard times proportionally) to the corresponding time value for that band, restore the normal compose preview, and dismiss the test-strip view.
39. WHEN split-grade mode is active and the user clicks a test-strip band, THE SYSTEM SHALL scale the soft and hard times proportionally so their sum equals the clicked band's total seconds (preserving their existing ratio; if both are 0 the split is set to 50/50).
40. THE SYSTEM SHALL display the "Tira de prueba" button only in compose state; it SHALL be disabled in all other states.
41. WHEN the user clicks "Tira de prueba" with no image loaded, THE SYSTEM SHALL do nothing (button remains disabled until an image is present).
42. THE SYSTEM SHALL return to compose preview and re-enable all compose-state controls when a test-strip band is clicked, leaving the workflow state as compose.
