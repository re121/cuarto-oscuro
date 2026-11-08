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
