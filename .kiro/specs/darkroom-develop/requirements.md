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
