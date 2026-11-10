// The Boston page's MCPG v2 decoding (src/pages/polygon/boston/bostonData.ts).
// The same fixtures are decoded by the Android (BostonDataTest.kt) and iOS
// (BostonDataTests.swift) tests. Run with `npm test` (Node strips the types).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { decodeMcpg } from '../src/pages/polygon/boston/bostonData.ts';

/**
 * Two polygons with every field (fields = 15), written by the generator
 * (tools/boston/fixture.py): the same polygons at 1e-6 and at 1e-5 degree.
 */
const hex = (h) => Uint8Array.from(h.match(/../g).map((b) => parseInt(b, 16)));
const fixtures = {
  '1e-6': hex(
    '4d43504702000000020000000f067c020109436166c3a920e298950204f4abb228a7b0e24300d00fd00f0000cf0f03db0bd804' +
      'd8040000a006000802000103ffea068ff40414142700',
  ),
  '1e-5': hex(
    '4d43504702000000020000000f057c020109436166c3a920e298950204b284850483b8e30600c801c8010000c7010395013c3c' +
      '000050000802000103bf57e73e02020300',
  ),
};
const fixture = fixtures['1e-6'];

const near = (actual, expected) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-9, `${i}: ${v} != ${expected[i]}`));
};

for (const [unit, bytes] of Object.entries(fixtures)) {
  test(`decodes every field and closes each ring again (${unit} degree)`, () => {
    const [first, second, ...rest] = decodeMcpg(bytes, 't');
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
}

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

const bundled = (name) => new Uint8Array(readFileSync(new URL(`../public/boston/${name}`, import.meta.url)));
const vertexCount = (polygons) => polygons.reduce((n, b) => n + b.rings.reduce((m, r) => m + r.length / 2, 0), 0);

test('the bundled city buildings file has every building, at 1e-6 degree', () => {
  const bytes = bundled('boston-city-buildings.bin');
  assert.equal(bytes[13], 6);
  const polygons = decodeMcpg(bytes, 'buildings');
  assert.equal(polygons.length, 105599);
  assert.equal(vertexCount(polygons), 722875);
});

test('the bundled city parcels file has every parcel with a land use, at 1e-5 degree', () => {
  const bytes = bundled('boston-city-parcels.bin');
  assert.equal(bytes[13], 5);
  const polygons = decodeMcpg(bytes, 'parcels');
  assert.equal(polygons.length, 98815);
  assert.equal(vertexCount(polygons), 774844);
  assert.ok(polygons.every((b) => b.use !== undefined && b.rings.every((r) => r.length >= 8)));
});
