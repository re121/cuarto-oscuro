import test from 'node:test';
import assert from 'node:assert/strict';
import { develop } from '../src/develop.js';
test('endpoints', () => { assert.equal(develop(0), 0); assert.equal(develop(1), 1); });
test('monotonic and bounded', () => {
  let prev = -1;
  for (let i = 0; i <= 100; i++) { const v = develop(i / 100); assert.ok(v >= prev && v >= 0 && v <= 1); prev = v; }
});
