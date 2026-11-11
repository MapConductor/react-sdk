import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { decodeAntennas, horizonMeters } from '../src/pages/circle/antennas/antennaData.ts';
test('OpenCellID snapshot preserves all cells and carrier counts', () => {
 const b = readFileSync(new URL('../public/antennas/us-antennas.bin', import.meta.url));
 const rows = decodeAntennas(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
 assert.equal(rows.length, 723800);
 assert.ok(rows.every(a => Math.abs(a.latitude * 100000 - Math.round(a.latitude * 100000)) < 1e-6 && Math.abs(a.longitude * 100000 - Math.round(a.longitude * 100000)) < 1e-6), 'coordinates have at most five decimals');
 assert.equal(new Set(rows.map(a => a.registration)).size, rows.length);
 assert.ok(rows.some(a => a.latitude > 60 && a.longitude < -130), 'includes Alaska');
 assert.ok(rows.every(a => a.radius > 0 && a.radius <= 100000));
 assert.deepEqual([0,1,2,3].map(c => rows.filter(a => a.carrier === c).length), [199569,372599,147164,4468]);
});
test('truncation and incorrect format are rejected', () => {
 assert.throws(() => decodeAntennas(new ArrayBuffer(0)));
 assert.throws(() => decodeAntennas(new ArrayBuffer(8)));
 const b = new ArrayBuffer(8); const v = new DataView(b);v.setUint32(0,0x4d434341);v.setUint32(4,1,true);
 assert.throws(() => decodeAntennas(b));
});
test('sphere tangent horizon increases with height and has the documented scale', () => {
 assert.ok(horizonMeters(100) > horizonMeters(60));
 assert.ok(Math.abs(horizonMeters(100) - 40084) < 10);
});
