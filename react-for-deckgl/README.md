# @mapconductor/react-for-deckgl

deck.gl provider for the MapConductor React SDK. Renders a
[deck.gl](https://deck.gl/) scene through MapConductor's provider-independent
camera, marker, and overlay API, so the same application code can also run on
Google Maps, MapLibre, Mapbox, MapTiler, Leaflet, OpenLayers, ArcGIS, Cesium,
HERE, TomTom, Longdo, or Mappls.

## Installation

```shell
npm install @mapconductor/react-for-deckgl @mapconductor/js-sdk-core @mapconductor/js-sdk-react
```

No API key and no stylesheet. `@deck.gl/core`, `@deck.gl/layers` and
`@deck.gl/geo-layers` come in as dependencies.

## The base map

**deck.gl draws layers; it has no map of its own.** Every other provider in this
SDK wraps a map engine that already renders a base map, so `mapDesignType` there
selects a style the engine owns. Here the base map is part of the driver: a
`DeckGLDesign` is a raster tile template, and the driver lays it down with
`TileLayer` + `BitmapLayer` underneath everything else.

`DeckGLDesign.Standard` (OpenStreetMap), `.Light` / `.Dark` (CARTO),
`.Satellite` (Esri World Imagery) and `.None` are provided. Any XYZ tile service
works:

```ts
const gsi = new DeckGLDesign({
  id: 'gsi-standard',
  tileUrl: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  tileSize: 256,
  maxZoom: 18,
  attributionRules: [{ attribution: '国土地理院' }],
});
```

`attributionRules` is what `MapAttributionOverlay` renders — a tile service you
point at is yours to attribute.

## Usage

```tsx
import {
  DeckGLDesign,
  DeckGLMapView,
  useDeckGLMapViewState,
} from '@mapconductor/react-for-deckgl';
import { createGeoPoint, createMapCameraPosition } from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';

function Map() {
  const state = useDeckGLMapViewState({
    mapDesignType: DeckGLDesign.Standard,
    cameraPosition: createMapCameraPosition({
      position: createGeoPoint({ latitude: 35.681, longitude: 139.767 }), // Tokyo
      zoom: 12,
    }),
  });

  return (
    <DeckGLMapView state={state}>
      <Marker position={createGeoPoint({ latitude: 35.681, longitude: 139.767 })} />
    </DeckGLMapView>
  );
}
```

## How overlays are drawn

| MapConductor | deck.gl |
| --- | --- |
| base map / raster layer | `TileLayer` + `BitmapLayer` |
| marker | one shared `IconLayer` for every marker |
| circle / polygon | `PolygonLayer` |
| polyline | `PathLayer` |
| ground image | `BitmapLayer` |

Markers share a single `IconLayer` rather than getting one layer each, the same
way the MapLibre driver puts them all in one symbol layer: per-marker layers
would make deck.gl's layer matching and draw calls scale with the marker count.

Overlay layers are declared `pickable: false` on purpose. Clicks go through
MapConductor's own geometric hit test (`marker → circle → groundImage →
polyline → polygon → map`, first hit wins, with the shared tap tolerance), so
the click order and hit areas match every other provider instead of following
deck.gl's GPU picking.

## Zoom

deck.gl's `WebMercatorViewport` uses a 512px world, like Mapbox and MapLibre.
The unified zoom this SDK exposes is the Google Maps 256px one, so the driver
adds **+1** on the way out and subtracts it on the way in
(`ZoomAltitudeConverter`). Verified against Google Maps, MapLibre and
OpenLayers on the `visible-region` sample: identical centre, zoom and bounds.

## Camera events

deck.gl has no `moveend`. `onViewStateChange` fires per frame while the camera
moves, and the driver reports a move as finished once ~140ms pass with no
further change (shorter once deck.gl reports that the interaction and any
transition have ended). `onCameraMoveStart` / `onCameraMove` /
`onCameraMoveEnd` behave the same as on the other providers.

## Gestures

`applyUISettings` maps onto deck.gl's `MapController` options. One thing does
not map cleanly: **deck.gl's `dragRotate` covers bearing and pitch together.**
Disabling only one of `rotateGesture` / `tiltGesture` is not possible, so the
driver keeps both enabled and logs a one-time warning naming the one it could
not honour.

## License

Apache-2.0
