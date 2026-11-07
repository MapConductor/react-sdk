import { readFile } from 'node:fs/promises';

// Demo only: both renderers register built-in constructors (Object, Set, Error)
// under the same private property. MapLibre's Set registration makes Mapbox look
// up a class that is absent from its own registry, breaking all vector tiles.
// Keep the wire format ($name) intact; only isolate MapLibre's constructor key.
// Never apply this in the SDK package builds or modify installed dependencies.
const registryKey = '_mapconductorDemoMapLibreRegistryKey';
const maplibreModule = /[/\\]maplibre-gl[/\\].*\.[cm]?js$/;

function rewrite(code) {
  return code.replaceAll('_classRegistryKey', registryKey);
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
                build.onLoad({ filter: maplibreModule }, async ({ path }) => ({
                  contents: rewrite(await readFile(path, 'utf8')),
                  loader: 'js',
                }));
              },
            }],
          },
        },
      };
    },
    transform(code, id) {
      if (!maplibreModule.test(id.split('?')[0]) || !code.includes('_classRegistryKey')) return;
      return { code: rewrite(code), map: null };
    },
  };
}
