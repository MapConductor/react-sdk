# MapConductor React SDK

MapConductor provides a shared TypeScript and React API for Google Maps and MapLibre. The same core geometry, state, overlay, and controller abstractions are used by the web and React Native packages.

## Features

- Google Maps and MapLibre providers
- Web and React Native entry points
- Observable state objects for maps and overlays
- Marker, circle, polyline, polygon, GroundImage, and RasterLayer components
- Efficient bulk marker transport with `<Markers states={states} />`
- Heatmap and marker-clustering extensions
- Provider-independent camera and event APIs

## Packages

| Package | Purpose |
| --- | --- |
| `@mapconductor/js-sdk-core` | Geometry, observable state, controllers, overlays, and shared types |
| `@mapconductor/js-sdk-react` | Shared web and React Native components |
| `@mapconductor/react-for-googlemaps` | Google Maps provider and map view |
| `@mapconductor/react-for-maplibre` | MapLibre provider and map view |
| `@mapconductor/react-heatmap` | Heatmap extension |
| `@mapconductor/react-marker-clustering` | Marker-clustering extension |
| `@mapconductor/react-icons` | Shared icon components |

The former `js-sdk-reactnative`, `reactnative-for-googlemaps`, and `reactnative-for-maplibre` packages have been merged into `js-sdk-react` and the corresponding `react-for-*` packages. New code should not depend on the old packages.

## Installation

Install the core and React packages together with one or both providers:

```bash
npm install \
  @mapconductor/js-sdk-core \
  @mapconductor/js-sdk-react \
  @mapconductor/react-for-googlemaps \
  @mapconductor/react-for-maplibre
```

For React Native, normal package autolinking discovers the Android provider modules. Google Maps API keys must be supplied through `local.properties`, Gradle properties, or `GOOGLE_MAPS_API_KEY`; do not put keys in source files.

## State-first API

MapConductor state objects are mutable and observable. Create a state once, retain it for the component lifetime, and update its properties directly. Property updates are sent to the registered provider renderer without replacing the state or rebuilding the React overlay tree.

```tsx
import { useState } from 'react';
import {
  createCircleState,
  createGeoPoint,
} from '@mapconductor/js-sdk-core';
import { Circle } from '@mapconductor/js-sdk-react';

function RadiusCircle() {
  const [circleState] = useState(() =>
    createCircleState({
      id: 'radius-circle',
      center: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
      radiusMeters: 1000,
      strokeColor: '#2563eb',
      fillColor: 'rgba(37, 99, 235, 0.3)',
    })
  );

  const setRadius = (radiusMeters: number) => {
    circleState.radiusMeters = radiusMeters;
  };

  return <Circle state={circleState} />;
}
```

Components also provide convenience props such as `<Marker position={point} />`. For frequently updated overlays, prefer a retained state and `<Marker state={markerState} />`; this avoids extra React effects and recomposition.

For large marker collections, use `<Markers states={states} />` instead of creating one React component per marker.

## React Native quick start

The explicit `@mapconductor/js-sdk-react/native` entry point is recommended in shared workspaces and tooling that does not automatically resolve the `react-native` export condition.

### Google Maps

```tsx
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react/native';
import {
  GoogleMapDesign,
  GoogleMapView,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';

const TOKYO = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });

export function GoogleMapExample() {
  const mapState = useGoogleMapViewState({
    id: 'google-map',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: createMapCameraPosition({ position: TOKYO, zoom: 12 }),
  });
  const [markerState] = useState(() =>
    createMarkerState({ id: 'tokyo', position: TOKYO })
  );

  return (
    <GoogleMapView state={mapState} style={styles.map}>
      <Marker state={markerState} />
    </GoogleMapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
```

### MapLibre

```tsx
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react/native';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';

const TOKYO = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });

export function MapLibreExample() {
  const mapState = useMapLibreViewState({
    id: 'maplibre-map',
    mapDesignType: MapLibreDesign.DemoTiles,
    cameraPosition: createMapCameraPosition({ position: TOKYO, zoom: 12 }),
  });
  const [markerState] = useState(() =>
    createMarkerState({ id: 'tokyo', position: TOKYO })
  );

  return (
    <MapLibreView state={mapState} style={styles.map}>
      <Marker state={markerState} />
    </MapLibreView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
```

The React Native example uses a common `MapViewContainer` to select the provider from the runtime type of the retained view state. See [`examples/reactnative-basic/src/pages/MapViewContainer.tsx`](./examples/reactnative-basic/src/pages/MapViewContainer.tsx).

Overlays may be declared before `onMapLoaded`. The provider controller queues pending compositions until the native map is ready, so page-level readiness gates should not be necessary for ordinary overlays.

## Web quick start

The same state and overlay components are available from the default React entry point:

```tsx
import { useState } from 'react';
import {
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';
import {
  GoogleMapDesign,
  GoogleMapView,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';

const TOKYO = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });

export function WebGoogleMap({ apiKey }: { apiKey: string }) {
  const mapState = useGoogleMapViewState({
    id: 'web-google-map',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: createMapCameraPosition({ position: TOKYO, zoom: 12 }),
  });
  const [markerState] = useState(() =>
    createMarkerState({ id: 'tokyo', position: TOKYO })
  );

  return (
    <GoogleMapView state={mapState} apiKey={apiKey} style={{ height: 480 }}>
      <Marker state={markerState} />
    </GoogleMapView>
  );
}
```

For MapLibre web maps, import the provider stylesheet once:

```tsx
import '@mapconductor/react-for-maplibre/style.css';
```

## Overlays

All ordinary overlays support both a retained-state form and convenience props. The retained-state form is preferred for updates.

### Marker

```tsx
const [markerState] = useState(() =>
  createMarkerState({
    id: 'draggable-marker',
    position,
    draggable: true,
    onDrag: (state) => console.log(state.position),
  })
);

markerState.position = nextPosition;

return <Marker state={markerState} />;
```

### Polyline and Polygon

```tsx
const [polylineState] = useState(() =>
  createPolylineState({
    id: 'route',
    points,
    strokeColor: '#dc2626',
    strokeWidth: 6,
  })
);

const [polygonState] = useState(() =>
  createPolygonState({
    id: 'area',
    points: outerRing,
    holes: [innerRing],
    strokeColor: '#1d4ed8',
    fillColor: 'rgba(37, 99, 235, 0.4)',
  })
);

polylineState.strokeWidth = 10;
polygonState.fillColor = 'rgba(37, 99, 235, 0.7)';

return (
  <>
    <Polyline state={polylineState} />
    <Polygon state={polygonState} />
  </>
);
```

### GroundImage

GroundImage supports bounds, image, opacity, and click updates. React Native Android accepts `android.resource:`, `content:`, `file:`, and `data:image` image URIs.

```tsx
const [groundImageState] = useState(() =>
  createGroundImageState({
    id: 'ground-image',
    bounds: createGeoRectBounds({ southWest, northEast }),
    imageUrl: 'android.resource://com.example.app/drawable/ground_image',
    opacity: 0.5,
    onClick: ({ clicked }) => console.log(clicked),
  })
);

groundImageState.opacity = 0.8;
groundImageState.bounds = nextBounds;

return <GroundImage state={groundImageState} />;
```

### RasterLayer

Raster sources support URL templates, TileJSON, and ArcGIS services.

```tsx
const source = RasterLayerSource.UrlTemplate({
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileSize: 256,
});

const [rasterLayerState] = useState(() =>
  createRasterLayerState({
    id: 'osm',
    source,
    opacity: 1,
  })
);

rasterLayerState.opacity = 0.5;

return <RasterLayer state={rasterLayerState} />;
```

Raster layers created by JSX and raster layers owned by native extensions share the provider collector. Clearing one composition preserves unrelated extension layers.

## React Native Android architecture

Ordinary markers use the native provider controller directly:

```text
JS MarkerState
  -> React Native batch bridge
  -> provider wrapper
  -> Android SDK provider controller
  -> Android SDK core
  -> Google Maps or MapLibre SDK
```

Large marker compositions build one icon registry per generation, send structure-of-arrays batches of 500 markers, wait for a native ACK after each batch, and commit the generation after the final ACK. Icon payloads are not repeated in every batch.

Heatmap and marker clustering use the generic native extension boundary. Extension-specific commands are not added to the public provider controller interfaces.

## Examples

- Web: [`examples/basic`](./examples/basic)
- React Native: [`examples/reactnative-basic`](./examples/reactnative-basic)

The React Native example includes provider-comparable pages for maps, markers, marker animation, post offices, clustering, circles, polylines, polygons, GroundImage, RasterLayer, and heatmap.

Run the web example:

```bash
npm run dev --workspace @mapconductor/example-basic
```

Run the React Native Android example:

```bash
npm run dev:rn:android
```

## Repository structure

```text
react-sdk/
├── js-sdk-core/              # Provider-independent state and controller APIs
├── js-sdk-react/             # Shared React and React Native bindings
├── react-for-googlemaps/     # Google Maps web/RN provider
├── react-for-maplibre/       # MapLibre web/RN provider
├── react-icons/              # Shared icons
├── react-heatmap/            # Heatmap extension
├── react-marker-clustering/  # Marker-clustering extension
├── examples/basic/           # Web example
├── examples/reactnative-basic/ # React Native example
└── tests/                    # Integration and end-to-end tests
```

## Development

See [`llm.md`](./llm.md) for concise implementation guidance covering the state model, React Native bridge, GroundImage, RasterLayer, and example conventions. Repository contribution rules are in [`AGENTS.md`](./AGENTS.md).

Install dependencies and build all workspace packages:

```bash
npm install
npm run build
```

Common commands:

```bash
npm run lint
npm run test
npm run dev
npm run dev:packages
npm run dev:examples
```

For focused React Native verification:

```bash
npm run build --workspace @mapconductor/js-sdk-react
npm run build --workspace @mapconductor/react-for-googlemaps
npm run build --workspace @mapconductor/react-for-maplibre
npx tsc --noEmit --ignoreDeprecations 5.0 -p examples/reactnative-basic/tsconfig.json
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew \
    :android:mapconductor_js-sdk-react:compileDebugKotlin \
    :android:mapconductor_react-for-googlemaps:compileDebugKotlin \
    :android:mapconductor_react-for-maplibre:compileDebugKotlin \
    :android:app:compileDebugKotlin
```

The provider and shared SDK directories can be nested Git worktrees or submodules. Check them independently with `git -C <package> diff --check`.

## Android SDK dependencies

The React Native Android packages consume the sibling MapConductor Android SDK through MavenLocal:

- `com.mapconductor:for-googlemaps:1.2.0`
- `com.mapconductor:for-maplibre:1.2.0`
- `com.mapconductor:heatmap:1.0.2`
- `com.mapconductor:marker-clustering:1.0.2`

When changing the Android SDK, compile and publish the affected module to MavenLocal before rebuilding this repository.

## License

Apache License 2.0. See [`LICENSE`](./LICENSE).

## Related projects

- [MapConductor Android SDK](https://github.com/MapConductor/android-sdk)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [MapLibre](https://maplibre.org/)
