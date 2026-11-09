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

## Help modal
43. WHEN the user clicks the "¿Cómo funciona?" button, THE SYSTEM SHALL display a modal overlay containing the darkroom manual in Spanish with short, beginner-friendly sentences.
44. THE SYSTEM SHALL structure the manual into five numbered steps: (1) Componer, (2) Exponer, (3) Revelar, (4) Parar + Fijar, (5) Descargar copia; each step SHALL include a short title and one to three plain sentences explaining what it does.
45. THE SYSTEM SHALL include a brief plain-text explanation of the Test strip feature (one to two sentences) in the modal.
46. THE SYSTEM SHALL include a brief plain-text explanation of the Split-grade printing feature (one to two sentences) in the modal.
47. WHEN the user clicks a toggle button labelled "English" inside the modal, THE SYSTEM SHALL switch the modal body to English; WHEN the user clicks the same toggle (now labelled "Español"), THE SYSTEM SHALL switch back to Spanish.
48. WHEN the user clicks the close button or clicks outside the modal, THE SYSTEM SHALL dismiss the modal without changing any app state.
49. THE SYSTEM SHALL make the modal keyboard-accessible: pressing Escape SHALL close it, and focus SHALL be trapped inside the modal while it is open.
50. THE SYSTEM SHALL display the "¿Cómo funciona?" button in the saferow area (alongside the light and sound toggles) at all workflow states.
51. WHEN the state transitions from exposing to latent (after the enlarger countdown ends), THE SYSTEM SHALL update the status line to read "La imagen está latente: pulsa Revelar." in Spanish (or the English equivalent "Latent image: press Develop." if the UI is showing English — but since only the modal has a language toggle, the status line hint SHALL always appear in Spanish).
52. THE SYSTEM SHALL preserve all existing features unchanged; the modal SHALL contain no external URLs or external resources.

## Zone System overlay

67. WHEN the user clicks the "Zonas" toggle button in compose state, THE SYSTEM SHALL overlay the compose preview canvas with a false-colour zone map: each pixel's predicted print density (computed with the same density model as develop — same exposure, grade or split-grade times, and dodge/burn mask) SHALL be quantised into one of 11 zones (0–X) and coloured with a distinct false-colour palette.
68. WHEN the "Zonas" toggle is active and any of the exposure slider, contrast slider, split-grade time sliders, or dodge/burn mask changes, THE SYSTEM SHALL recompute and repaint the zone map immediately.
69. WHEN the user deactivates the "Zonas" toggle, THE SYSTEM SHALL restore the normal compose preview.
70. THE SYSTEM SHALL define the 11 zones (0 through X in Roman numerals) with the following false-colour palette: Zone 0 → #000000, Zone I → #1a1a1a (very dark blue-grey), Zone II → #2d4a7a, Zone III → #3a7a5e, Zone IV → #5a9a4a, Zone V → #a0a060, Zone VI → #c8b464, Zone VII → #d4c890, Zone VIII → #e8dfc0, Zone IX → #f2ece0, Zone X → #ffffff; boundaries evenly spaced across the [0,1] density range (each zone covers 1/11 of the range).
71. THE SYSTEM SHALL display a compact inline legend below the zone map (or below the canvas) showing all 11 zone swatches labelled 0 through X, styled to fit within the canvas width without scrolling.
72. WHEN the user activates the zone map, THE SYSTEM SHALL display a zone histogram bar chart of 11 vertical columns (zones 0 to X) below the legend, showing the percentage of image pixels in each zone, updated live whenever the density model changes.
73. WHEN the zone map is active and the user clicks a pixel on the canvas, THE SYSTEM SHALL display a tooltip (or inline status message) identifying the zone of the clicked pixel and its standard Ansel Adams description in Spanish (e.g. "Zona III — sombras con textura") or English when the help-modal language is set to EN; the tooltip SHALL dismiss on the next click or when the zone toggle is deactivated.
74. THE SYSTEM SHALL define the following Adams descriptions for each zone, in both Spanish and English:
    Zone 0: ES "negro absoluto — sin detalle" / EN "absolute black — no detail";
    Zone I: ES "casi negro — sin textura" / EN "near black — no texture";
    Zone II: ES "negros con textura apenas visible" / EN "blacks with barely visible texture";
    Zone III: ES "sombras con textura" / EN "shadows with texture";
    Zone IV: ES "sombras oscuras con detalle" / EN "dark shadows with detail";
    Zone V: ES "gris medio — 18% de reflectancia" / EN "middle grey — 18% reflectance";
    Zone VI: ES "luces suaves con textura" / EN "soft lights with texture";
    Zone VII: ES "luces brillantes con detalle" / EN "bright lights with detail";
    Zone VIII: ES "luces casi sin textura" / EN "lights with almost no texture";
    Zone IX: ES "blanco puro con textura apenas visible" / EN "pure white with barely visible texture";
    Zone X: ES "blanco absoluto — sin detalle" / EN "absolute white — no detail".
75. WHEN the zone histogram shows that more than 30% of pixels fall in zones 0–I combined, THE SYSTEM SHALL display a plain-language tip: ES "Sombras sin detalle: aumenta la exposición o baja el grado." / EN "Shadows without detail: increase exposure or lower the grade."
76. WHEN the zone histogram shows that more than 30% of pixels fall in zones IX–X combined, THE SYSTEM SHALL display a plain-language tip: ES "Luces quemadas: reserva las altas luces o baja el grado." / EN "Burned highlights: dodge the bright areas or lower the grade."
77. WHEN zones 0–I combined and zones IX–X combined are each below 30%, THE SYSTEM SHALL display a positive tip: ES "Distribución equilibrada: buen rango tonal." / EN "Balanced distribution: good tonal range."
78. THE SYSTEM SHALL show the "Zonas" toggle only in compose state; the button SHALL be disabled (and the overlay, histogram, and tooltip hidden) in all other workflow states.
79. THE SYSTEM SHALL add a "Sistema de zonas" section to both the Spanish and English content objects (HELP_ES / HELP_EN extras) in the help modal, explaining the Zone System in two to four plain sentences accessible to beginners.
80. THE SYSTEM SHALL keep all existing features (compose preview, dodge/burn, split-grade, test strip, toning, grain, sound, safelight, export, film strip, state machine) unchanged when the zone overlay is off.

## Film strip negative carrier
53. WHEN the page loads, THE SYSTEM SHALL display a vertical 35mm film strip panel to the left of the enlarger bench, containing at least one frame: the built-in default negative as frame 1.
54. WHEN the user selects one or more image files via the "Cargar imagen" file input (which SHALL accept `multiple` files), THE SYSTEM SHALL add one thumbnail frame per file to the film strip, assigning sequential frame labels ("1A", "2A", "3A", …) and immediately select the first newly-added frame.
55. WHEN the film strip contains frames, THE SYSTEM SHALL render each frame as an inverted (negative) greyscale thumbnail on a dark orange-brown film-base background, with rectangular sprocket holes punched along both vertical edges of the strip and a small yellow frame-number label below the sprocket holes.
56. WHEN the user clicks a frame in the film strip, THE SYSTEM SHALL load that frame's image data as `rawGray`, reset `mask` to all-ones, reset workflow state to `compose`, redraw the compose preview, and highlight the selected frame with a coloured border.
57. WHEN a frame is selected, THE SYSTEM SHALL show a small "×" remove button on that frame; clicking it SHALL remove the frame from the strip, select the previous frame (or the next if no previous exists); if removing the last frame, THE SYSTEM SHALL clear the canvas and rawGray and return to the initial "Coloca el negativo" status.
58. WHEN the viewport is wider than 780 px, THE SYSTEM SHALL display the film strip as a fixed-width vertical column to the left of `.studio`; WHEN the viewport is 780 px or narrower, THE SYSTEM SHALL display the strip as a horizontal scrollable row above the enlarger bench.
59. THE SYSTEM SHALL store each frame's full-resolution image data (the original `src` URL or decoded pixel data) so that selecting a previously-loaded frame re-decodes correctly without re-reading the file.
60. THE SYSTEM SHALL render sprocket holes as a repeating pattern of small rounded rectangles on both sides of the strip, spaced evenly between frames.
61. THE SYSTEM SHALL number frames with labels in the format "NA" where N increments from 1, rendered in small yellow monospace type consistent with the app's existing typography.
62. THE SYSTEM SHALL apply a film-base background colour of approximately `#3d1f0a` (dark orange-brown) to the strip container, distinct from the app's panel and room colours.
63. WHEN the safelight is toggled on (body.lit), THE SYSTEM SHALL keep the film strip in its dark film-base appearance (the strip is not affected by the light toggle).
64. THE SYSTEM SHALL allow the user to add more images at any time (in any workflow state) by using the file input; adding a new image SHALL not disrupt an in-progress expose, develop, or fix operation on the current frame.
65. THE SYSTEM SHALL preserve all existing features (dodge/burn, split-grade, test strip, help modal, toning, grain, export, safelight, sound, state machine) unchanged.
66. THE SYSTEM SHALL process all images locally using `FileReader`; no image data SHALL be uploaded or transmitted over the network.
