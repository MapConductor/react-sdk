import { readFile } from 'node:fs/promises';

// Demo only: both renderers register built-in constructors (Object, Set, Error)
// under the same private property. MapLibre's Set registration makes Mapbox look
// up a class that is absent from its own registry, breaking all vector tiles.
// Keep the wire format ($name) intact; isolate each renderer's constructor key.
// Never apply this in the SDK package builds or modify installed dependencies.
// Longdo loads its own external MapLibre; isolate Mapbox too so foreign
// constructor registrations cannot bypass its built-in serialization handling.
const rendererModule = /(?:maplibre-gl|mapbox-gl).*\.[cm]?js$/;

function rewrite(code, id) {
  const renderer = id.includes('mapbox-gl') ? 'Mapbox' : 'MapLibre';
  return code.replaceAll('_classRegistryKey', `_mapconductorDemo${renderer}RegistryKey`);
}

/** @returns {import('vite').Plugin} */
export function isolateMapLibreRegistry() {
  return {
    name: 'demo-isolate-maplibre-registry',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [{
              name: 'demo-isolate-maplibre-registry',
              setup(build) {
                build.onLoad({ filter: rendererModule }, async ({ path }) => ({
                  contents: rewrite(await readFile(path, 'utf8'), path),
                  loader: 'js',
                }));
              },
            }],
          },
        },
      };
    },
    transform(code, id) {
      if (!rendererModule.test(id.split('?')[0]) || !code.includes('_classRegistryKey')) return;
      return { code: rewrite(code, id), map: null };
    },
  };
}
