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
