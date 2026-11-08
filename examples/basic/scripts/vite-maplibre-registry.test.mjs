import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import { isolateMapLibreRegistry } from './vite-maplibre-registry.mjs';

const require = createRequire(import.meta.url);
const maplibrePath = require.resolve('maplibre-gl/dist/maplibre-gl-dev.mjs');
const maplibre = await readFile(maplibrePath, 'utf8');
const mapbox = await readFile(require.resolve('mapbox-gl/dist/mapbox-gl-dev.js'), 'utf8');
const plugin = isolateMapLibreRegistry();

function serializeWithBothRenderers(maplibreCode, order, mapboxCode = mapbox) {
  // Exercise the installed libraries' actual registration/serialization code.
  // Separate registries, shared built-in constructors, just like a browser page.
  const registerStart = maplibreCode.indexOf('function register(name, klass, options = {})');
  assert.ok(registerStart >= 0, 'MapLibre registration code changed; review the workaround');
  const registerEnd = maplibreCode.indexOf('register("Object", Object);', registerStart);
  assert.ok(registerEnd > registerStart);
  const serializeStart = mapboxCode.indexOf('function serialize(input, transferables)');
  const serializeEnd = mapboxCode.indexOf('function deserialize(input)', serializeStart);
  assert.ok(serializeStart >= 0 && serializeEnd > serializeStart);
  const registerMaplibre = `(() => {
    const registry = {};
    ${maplibreCode.slice(registerStart, registerEnd)}
    register('Object', Object); register('Set', Set); register('Error', Error);
  })();`;
  const registerStartBox = mapboxCode.indexOf('function register(klass, name, options = {})');
  const registerEndBox = mapboxCode.indexOf('register(Object, "Object");', registerStartBox);
  assert.ok(registerStartBox >= 0 && registerEndBox > registerStartBox);
  const registerMapbox = `${mapboxCode.slice(registerStartBox, registerEndBox)} register(Object, 'Object');`;
  return runInNewContext(`
    class ImageBitmap {} class ImageData {} class Headers {}
    const assert = () => {}; // Mapbox's production assertions are compiled out.
    const registry = {Object: {omit: []}};
    const isArrayBuffer = value => value instanceof ArrayBuffer;
    ${order === 'mapbox-first' ? registerMapbox + registerMaplibre : registerMaplibre + registerMapbox}
    ${mapboxCode.slice(serializeStart, serializeEnd)}
    JSON.stringify(serialize({tiles: new Set([1, 2])}));
  `);
}

test('reproduces the installed MapLibre/Mapbox registry collision', () => {
  assert.throws(() => serializeWithBothRenderers(maplibre, 'maplibre-first'), /omit/);
});

test('production transform permits both load orders without changing the wire format', () => {
  const transformed = plugin.transform(maplibre, maplibrePath).code;
  for (const order of ['maplibre-first', 'mapbox-first']) {
    assert.deepEqual(JSON.parse(serializeWithBothRenderers(transformed, order)), {
      tiles: {$name: 'Set', 1: 1, 2: 2},
    });
  }
  assert.equal(plugin.transform('const x = 1;', '/unrelated/library.js'), undefined);
});

test('Mapbox coexists with unmodified external MapLibre as loaded by Longdo', () => {
  const transformed = plugin.transform(mapbox, require.resolve('mapbox-gl')).code;
  for (const order of ['maplibre-first', 'mapbox-first']) {
    assert.deepEqual(JSON.parse(serializeWithBothRenderers(maplibre, order, transformed)), {
      tiles: {$name: 'Set', 1: 1, 2: 2},
    });
  }
});

test('Vite dependency optimization applies the same isolation to MapLibre', async () => {
  const config = plugin.config();
  const result = await build({
    entryPoints: [require.resolve('maplibre-gl/dist/maplibre-gl.mjs')],
    bundle: true,
    write: false,
    format: 'esm',
    plugins: config.optimizeDeps.esbuildOptions.plugins,
  });
  assert.ok(result.outputFiles[0].text.includes('_mapconductorDemoMapLibreRegistryKey'));
  assert.ok(!result.outputFiles[0].text.includes('_classRegistryKey'));
  assert.equal(await readFile(maplibrePath, 'utf8'), maplibre);
});
