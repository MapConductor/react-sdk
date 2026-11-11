// The Boston trees page's circle file (src/pages/circle/boston/treesFile.ts).
// The same fixture is decoded by the Android (BostonTreesDataTest.kt) and iOS
// (BostonTreesDataTests.swift) tests. Run with `npm test` (Node strips the types).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { decodeTrees, TREE_GROUPS } from '../src/pages/circle/boston/treesFile.ts';

/**
 * Two tree circles (fields tree group | circles, 1e-5 degree), written by the
 * generator (tools/boston/fixture.py): an oak of 150.0 m (a two-byte varint
 * radius) and an "other" of 0.1 m, the second centre south-west of the first.
 */
const hex = (h) => Uint8Array.from(h.match(/../g).map((b) => parseInt(b, 16)));
const fixture = hex('4d4350470200000002000000c00501dc0bb284850483b8e3060701d156db3d');

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('decodes the shared fixture: centres, radii and groups', () => {
  const [first, second, ...rest] = decodeTrees(fixture, 't');
  assert.equal(rest.length, 0);
  assert.equal(first.id, 't-0');
  assert.equal(first.group, 'oak');
  near(first.radiusMeters, 150);
  near(first.latitude, 42.35545);
  near(first.longitude, -71.0605);

  assert.equal(second.id, 't-1');
  assert.equal(second.group, 'other');
  near(second.radiusMeters, 0.1);
  near(second.latitude, 42.3);
  near(second.longitude, -71.1);
});

test('rejects a file of polylines or polygons (no circles bit) and a version 1 file', () => {
  const lines = fixture.slice();
  lines[12] = 16 | 32;
  assert.throws(() => decodeTrees(lines, 't'), /circles/);
  const polygons = fixture.slice();
  polygons[12] = 128;
  assert.throws(() => decodeTrees(polygons, 't'), /circles/);
  const v1 = fixture.slice();
  v1[4] = 1;
  assert.throws(() => decodeTrees(v1, 't'), /MCPG v2/);
});

test('the bundled trees file has every tree of the city, at 1e-5 degree', () => {
  const bytes = new Uint8Array(readFileSync(new URL('../public/boston/boston-city-trees.bin', import.meta.url)));
  assert.equal(bytes.byteLength, 214_367);
  assert.equal(bytes[12], 64 | 128);
  assert.equal(bytes[13], 5);
  const trees = decodeTrees(bytes, 'tree');
  assert.equal(trees.length, 52_028);
  assert.equal(new Set(trees.map((t) => t.id)).size, 52_028);
  for (const t of trees) {
    // Inside the city's bounding box; a crown estimate between 1 m and 15 m, in 0.1 m.
    assert.ok(t.longitude > -71.2 && t.longitude < -70.9 && t.latitude > 42.22 && t.latitude < 42.4, t.id);
    assert.ok(t.radiusMeters >= 1 && t.radiusMeters <= 15, `${t.id}: ${t.radiusMeters}`);
    assert.ok(Math.abs(t.radiusMeters * 10 - Math.round(t.radiusMeters * 10)) < 1e-9);
  }
  const radii = trees.map((t) => t.radiusMeters).sort((a, b) => a - b);
  assert.equal(radii[Math.floor(radii.length / 2)], 2);
  const byGroup = Object.fromEntries(TREE_GROUPS.map((g) => [g, 0]));
  for (const t of trees) byGroup[t.group]++;
  assert.deepEqual(byGroup, {
    maple: 8914, oak: 6738, honeylocust: 7625, linden: 4747, elm: 3689, flowering: 7741, conifer: 525, other: 12049,
  });
});
