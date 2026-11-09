// The Boston roads page's polyline file (src/pages/polyline/boston/roadsFile.ts).
// The same fixture is decoded by the Android (BostonRoadsDataTest.kt) and iOS
// (BostonRoadsDataTests.swift) tests. Run with `npm test` (Node strips the types).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { decodeRoads, ROAD_CLASSES } from '../src/pages/polyline/boston/roadsFile.ts';

/**
 * Two road polylines (fields name | road class | lines, 1e-5 degree), written by
 * the generator (tools/boston/fixture.py): a multi-byte name, an open three-point
 * path, and a nameless two-point path.
 */
const hex = (h) => Uint8Array.from(h.match(/../g).map((b) => parseInt(b, 16)));
const fixture = hex(
  '4d4350470200000002000000380510436166c3a92053747265657420e29895010103b284850483b8e30614140a2800060102ef56973e1313',
);

const near = (actual, expected) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-9, `${i}: ${v} != ${expected[i]}`));
};

test('decodes the shared fixture: points, names and classes, paths left open', () => {
  const [first, second, ...rest] = decodeRoads(fixture, 'r');
  assert.equal(rest.length, 0);
  assert.equal(first.id, 'r-0');
  assert.equal(first.name, 'Café Street ☕');
  assert.equal(first.cls, 'primary');
  near(first.path, [-71.0605, 42.35545, -71.0604, 42.35555, -71.0602, 42.3556]);

  assert.equal(second.id, 'r-1');
  assert.equal(second.name, undefined);
  assert.equal(second.cls, 'path');
  near(second.path, [-71.1, 42.3, -71.1001, 42.2999]);
});

test('rejects a polygon file (no lines bit) and a version 1 file', () => {
  const polygons = fixture.slice();
  polygons[12] = 8 | 16;
  assert.throws(() => decodeRoads(polygons, 'r'), /polylines/);
  const v1 = fixture.slice();
  v1[4] = 1;
  assert.throws(() => decodeRoads(v1, 'r'), /MCPG v2/);
});

test('the bundled roads file has every road of the city, at 1e-5 degree', () => {
  const bytes = new Uint8Array(readFileSync(new URL('../public/boston/boston-city-roads.bin', import.meta.url)));
  assert.equal(bytes.byteLength, 1_019_811);
  assert.equal(bytes[12], 8 | 16 | 32);
  assert.equal(bytes[13], 5);
  const roads = decodeRoads(bytes, 'road');
  assert.equal(roads.length, 54_645);
  assert.equal(roads.reduce((n, r) => n + r.path.length / 2, 0), 234_765);
  assert.ok(roads.every((r) => r.path.length >= 4 && ROAD_CLASSES.includes(r.cls)));
  assert.equal(new Set(roads.map((r) => r.id)).size, 54_645);
  // Inside the city's bounding box.
  for (const r of roads) {
    for (let i = 0; i < r.path.length; i += 2) {
      assert.ok(r.path[i] > -71.2 && r.path[i] < -70.86 && r.path[i + 1] > 42.22 && r.path[i + 1] < 42.4);
    }
  }
  const byClass = Object.fromEntries(ROAD_CLASSES.map((c) => [c, 0]));
  for (const r of roads) byClass[r.cls]++;
  assert.deepEqual(byClass, { highway: 911, primary: 2320, secondary: 2829, tertiary: 1229, local: 11226, service: 9950, path: 26180 });
});
