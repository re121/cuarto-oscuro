// Pure develop curve: monotonic, develop(0)=0, develop(1)=1.
export function develop(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x); // smoothstep
}

// Test-strip constants shared with tests.
export const testStripTimes = [3, 6, 9, 12, 15];
export function testStripBandWidth(canvasWidth) {
  return Math.floor(canvasWidth / testStripTimes.length);
}

// Help modal constant shared with tests.
export const HELP_STEP_COUNT = 5;

// Film strip label helper shared with tests.
export function filmStripLabel(oneBasedIndex) {
  return String(oneBasedIndex) + 'A';
}

// Zone System helpers shared with tests.

/**
 * Map a normalised print density [0,1] to an Adams zone number 0–10.
 * The scale is divided into 11 equal bands; density 1.0 maps to zone 10.
 */
export function densityToZone(d) {
  return Math.min(10, Math.max(0, Math.floor(d * 11)));
}

/**
 * Compute an 11-element histogram (pixel counts) over a Float32Array of
 * normalised densities.  Returns a plain Array of 11 numbers.
 */
export function zoneHistogram(densities) {
  const hist = new Array(11).fill(0);
  for (let i = 0; i < densities.length; i++) {
    hist[densityToZone(densities[i])]++;
  }
  return hist;
}
