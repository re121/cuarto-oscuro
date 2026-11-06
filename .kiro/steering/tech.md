# Tech

- Vanilla HTML/CSS/JS — no framework, no build step, no bundler.
- Canvas 2D API for all image processing: greyscale decode, per-pixel tone curve, dodge/burn mask, development animation, grain, toning, export.
- Web Audio API for sound: oscillators (enlarger click, countdown tick) and looped pink-noise buffer (developer agitation). Nodes created lazily on first user gesture.
- `FileReader` + `Image` for local file loading. Images are never sent over the network.
- `canvas.toBlob()` + object URL for PNG export.
- `requestAnimationFrame` loop for the shadows-first development animation (~7 s).
- CSS custom properties for theming; a single `body.lit` class swaps the safelight colour scheme.
- Responsive layout: CSS Grid with a single-column breakpoint at 780 px; safe-area insets for notched screens.
- Accessible: buttons use `aria-pressed` for tool/toner state; colour contrast ratios within the dark scheme meet WCAG AA for the UI chrome.
- No tests in the shipped app (the single-file format made a separate test harness impractical during the jam). A property-test stub for the curve function was explored via Node's built-in test runner + fast-check but not retained.
