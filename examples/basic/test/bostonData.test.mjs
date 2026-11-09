// The Boston page's MCPG v2 decoding (src/pages/polygon/boston/bostonData.ts).
// The same fixture is decoded by the Android (BostonDataTest.kt) and iOS
// (BostonDataTests.swift) tests. Run with `npm test` (Node strips the types).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { decodeMcpg } from '../src/pages/polygon/boston/bostonData.ts';

/** Two polygons with every field (fields = 15), written by the generator (pack.py write_v2). */
const fixture = Uint8Array.from(
  ('4d43504702000000020000000f7c020109436166c3a920e298950204f4abb228a7b0e24300d00fd00f0000cf0f03db0bd804' +
    'd8040000a006000802000103ffea068ff40414142700').match(/../g).map((h) => parseInt(h, 16)),
);

const near = (actual, expected) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-9, `${i}: ${v} != ${expected[i]}`));
};

test('decodes every field and closes each ring again', () => {
  const [first, second, ...rest] = decodeMcpg(fixture, 't');
  assert.equal(rest.length, 0);
  assert.equal(first.id, 't-0');
  assert.equal(first.h, 12.3);
  assert.equal(first.use, 'condo');
  assert.equal(first.l, 1);
  assert.equal(first.n, 'Café ☕');
  assert.equal(first.rings.length, 2);
  near(first.rings[0], [-71.0605, 42.35545, -71.0595, 42.35545, -71.0595, 42.35645, -71.0605, 42.35645, -71.0605, 42.35545]);
  near(first.rings[1], [-71.0602, 42.3557, -71.0602, 42.356, -71.0598, 42.356, -71.0602, 42.3557]);

  assert.equal(second.id, 't-1');
  assert.equal(second.h, null);
  assert.equal(second.use, 'unknown');
  assert.equal(second.l, 2);
  assert.equal(second.n, undefined);
  near(second.rings[0], [-71.1, 42.3, -71.09999, 42.30001, -71.09999, 42.29999, -71.1, 42.3]);
});

test('rejects a version 1 file', () => {
  const v1 = fixture.slice();
  v1[4] = 1;
  assert.throws(() => decodeMcpg(v1, 't'), /MCPG v2/);
});

test('the bundled downtown file has every building of the three areas', () => {
  const polygons = decodeMcpg(new Uint8Array(readFileSync(new URL('../public/boston/boston-downtown.bin', import.meta.url))), 'downtown');
  assert.equal(polygons.length, 9467);
  assert.equal(polygons.reduce((n, b) => n + b.rings.reduce((m, r) => m + r.length / 2, 0), 0), 73289);
  assert.equal(polygons.reduce((n, b) => n + b.rings.length, 0), 9504);
  const levels = [0, 0, 0];
  for (const b of polygons) levels[b.l]++;
  assert.deepEqual(levels, [605, 2222, 6640]);
  assert.equal(polygons.filter((b) => b.h === null).length, 362);
  assert.equal(polygons.filter((b) => b.n !== undefined).length, 762);
  assert.equal(new Set(polygons.map((b) => b.id)).size, 9467);
  const ring = polygons[0].rings[0];
  assert.equal(polygons[0].h, 5.2);
  assert.equal(polygons[0].l, 2);
  near(ring.slice(0, 2), [-71.076105, 42.373684]);
  near(ring.slice(16, 18), [-71.076105, 42.373684]);
});
