import test from 'node:test';
import assert from 'node:assert/strict';
import { develop } from '../src/develop.js';
test('endpoints', () => { assert.equal(develop(0), 0); assert.equal(develop(1), 1); });
test('monotonic and bounded', () => {
  let prev = -1;
  for (let i = 0; i <= 100; i++) { const v = develop(i / 100); assert.ok(v >= prev && v >= 0 && v <= 1); prev = v; }
});

import { testStripTimes, testStripBandWidth } from '../src/develop.js';
test('testStripTimes are [3,6,9,12,15]', () => {
  assert.deepEqual(testStripTimes, [3, 6, 9, 12, 15]);
});
test('testStripBandWidth for 460px canvas is 92', () => {
  assert.equal(testStripBandWidth(460), 92);
});

import { HELP_STEP_COUNT } from '../src/develop.js';
test('HELP_STEP_COUNT is 5', () => {
  assert.equal(HELP_STEP_COUNT, 5);
});

import { filmStripLabel } from '../src/develop.js';
test('filmStripLabel produces 1A–5A', () => {
  assert.deepEqual(
    [1,2,3,4,5].map(filmStripLabel),
    ['1A','2A','3A','4A','5A']
  );
});

import { densityToZone, zoneHistogram } from '../src/develop.js';

test('densityToZone: 0 → zone 0', () => { assert.equal(densityToZone(0), 0); });
test('densityToZone: 1 → zone 10', () => { assert.equal(densityToZone(1), 10); });
test('densityToZone: 0.5 → zone 5', () => { assert.equal(densityToZone(0.5), 5); });
test('densityToZone: clamps below 0', () => { assert.equal(densityToZone(-1), 0); });
test('densityToZone: clamps above 1', () => { assert.equal(densityToZone(2), 10); });
test('densityToZone: 0.09090... boundary → zone 0', () => { assert.equal(densityToZone(1/11 - 0.0001), 0); });
test('densityToZone: exactly 1/11 → zone 1', () => { assert.equal(densityToZone(1/11), 1); });

test('zoneHistogram: empty array gives all zeros', () => {
  assert.deepEqual(zoneHistogram(new Float32Array(0)), new Array(11).fill(0));
});
test('zoneHistogram: single value 0 increments zone 0', () => {
  const h = zoneHistogram(new Float32Array([0]));
  assert.equal(h[0], 1);
  assert.equal(h.reduce((a, b) => a + b, 0), 1);
});
test('zoneHistogram: single value 1 increments zone 10', () => {
  const h = zoneHistogram(new Float32Array([1]));
  assert.equal(h[10], 1);
});
test('zoneHistogram: 11 evenly spaced values one per zone', () => {
  // Use the midpoint of each zone band: (i + 0.5) / 11 reliably lands in zone i
  const d = new Float32Array(11);
  for (let i = 0; i < 11; i++) d[i] = (i + 0.5) / 11;
  const h = zoneHistogram(d);
  assert.deepEqual(h, new Array(11).fill(1));
});
