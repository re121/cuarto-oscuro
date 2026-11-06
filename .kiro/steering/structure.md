# Structure

- `src/index.html` — the entire app: markup, CSS, and JavaScript in one self-contained file. No build step, no modules, no server required.
- All image processing, state management, audio, and UI wiring are inline `<script>` in that file.
- Pure logic (curve, exposure model, brush, animation) is kept in clearly named functions so it can be read and reasoned about independently of the DOM wiring.
- Visual language: near-black background (`#120707`), red safelight accent (`#e03a2a`), warm paper tones. Typography: Cormorant Garamond (display) + IBM Plex Mono (UI).
- No external dependencies beyond two Google Fonts families.
