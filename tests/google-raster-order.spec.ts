import { expect, test } from '@playwright/test';
import { createRasterLayerState } from '@mapconductor/js-sdk-core';
import { GoogleMapRasterLayerOverlayRenderer2D } from '../react-for-googlemaps/src/raster/GoogleMapRasterLayerOverlayRenderer2D';
import type { GoogleMapViewHolder2D } from '../react-for-googlemaps/src/GoogleMapViewHolder2D';

test('Google raster labels remain above ground after either layer is replaced', async () => {
  const globals = globalThis as unknown as { google: typeof google };
  const previousGoogle = globals.google;
  globals.google = {
    maps: {
      ImageMapType: class { constructor(options: object) { Object.assign(this, options); } },
      Size: class { constructor(readonly width: number, readonly height: number) {} },
    },
  } as unknown as typeof google;

  try {
    const layers: google.maps.ImageMapType[] = [];
    const holder = { map: { overlayMapTypes: {
      getArray: () => layers,
      getLength: () => layers.length,
      insertAt: (index: number, layer: google.maps.ImageMapType) => layers.splice(index, 0, layer),
      removeAt: (index: number) => layers.splice(index, 1),
    } } } as unknown as GoogleMapViewHolder2D;
    const renderer = new GoogleMapRasterLayerOverlayRenderer2D(holder);
    const state = (id: string, zIndex: number) => createRasterLayerState({
      id, zIndex, source: { type: 'UrlTemplate', template: `/tiles/${id}/{z}/{x}/{y}.png` },
    });

    let ground = renderer.create(state('ground', -2))!;
    let labels = renderer.create(state('labels', -1))!;
    const markers = renderer.create(state('markers', 100))!;
    expect(layers).toEqual([ground, labels, markers]);

    renderer.remove(ground);
    ground = renderer.create(state('ground', -2))!;
    expect(layers).toEqual([ground, labels, markers]);

    renderer.remove(labels);
    labels = renderer.create(state('labels', -1))!;
    expect(layers).toEqual([ground, labels, markers]);

    await renderer.onRemove(layers.map(layer => ({ layer })) as Parameters<typeof renderer.onRemove>[0]);
    expect(layers).toEqual([]);
  } finally {
    globals.google = previousGoogle;
  }
});
