import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUALITY_PRESETS,
  clamp,
  computeCatchupMultiplier,
  getQualityPreset,
  hashSeed,
  isTypingBurst,
  seededRandom,
  segmentGraphemes
} from '../dist/index.js';

test('presets resolve and fallback', () => {
  assert.ok(QUALITY_PRESETS.balanced);
  assert.equal(getQualityPreset('nope').burstWindowMs, QUALITY_PRESETS.balanced.burstWindowMs);
});

test('graphemes keep combining marks', () => {
  const segments = segmentGraphemes('a\u0301🙂');
  assert.equal(segments.length, 2);
});

test('catchup grows with backlog', () => {
  const low = computeCatchupMultiplier({ backlog: 0, isTypingBurst: false });
  const high = computeCatchupMultiplier({ backlog: 3000, isTypingBurst: true, quality: 'snappy' });
  assert.ok(high > low);
});

test('burst differs by preset', () => {
  assert.equal(isTypingBurst({ elapsedMs: 160, quality: 'calm' }), true);
  assert.equal(isTypingBurst({ elapsedMs: 160, quality: 'snappy' }), false);
});

test('clamp constrains values to range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

test('hashSeed returns deterministic unsigned integer', () => {
  assert.equal(hashSeed('penora'), hashSeed('penora'));
  assert.ok(hashSeed('hello') >= 0);
});

test('seededRandom returns deterministic value in [0,1)', () => {
  assert.equal(seededRandom(42), seededRandom(42));
  assert.ok(seededRandom(1) >= 0 && seededRandom(1) < 1);
});
