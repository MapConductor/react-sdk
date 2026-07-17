# MapConductor React SDK

MapConductor is a unified TypeScript and React API for Google Maps and MapLibre. This repository contains both web and React Native bindings. The React Native Android providers use the MapConductor Android SDK controllers supplied through MavenLocal; they do not copy the Android SDK implementation.

## Packages

- `@mapconductor/js-sdk-core`: provider-independent state, geometry, controller, and overlay APIs.
- `@mapconductor/js-sdk-react`: shared React bindings. React Native applications should import components from `@mapconductor/js-sdk-react/native` when an explicit native entry point is useful.
- `@mapconductor/react-for-googlemaps`: Google Maps view, view state, and provider implementation.
- `@mapconductor/react-for-maplibre`: MapLibre view, view state, and provider implementation.
- `@mapconductor/react-heatmap`: heatmap extension.
- `@mapconductor/react-marker-clustering`: marker-clustering extension.

The old `reactnative-for-googlemaps`, `reactnative-for-maplibre`, and `js-sdk-reactnative` packages have been folded into the packages above. Do not use or recreate the old packages.

## State model

MapConductor state objects are mutable and observable. Create a view or overlay state once, retain it for the component lifetime, and update its properties directly. A property mutation automatically reaches the registered overlay collector and provider renderer.

```tsx
const [circleState] = useState(() =>
  createCircleState({
    id: 'circle',
    center,
    radiusMeters: 1000,
    fillColor: 'rgba(0, 0, 255, 0.3)',
  })
);

function changeRadius(radiusMeters: number) {
  circleState.radiusMeters = radiusMeters;
}

return <Circle state={circleState} />;
```

Prefer this pattern over rebuilding `CircleState`, `MarkerState`, `PolylineState`, `PolygonState`, `GroundImageState`, `RasterLayerState`, or a provider view state after every React render. It reduces React recomposition and avoids replacing collector subscriptions.

Overlay components also accept convenience properties such as `<Marker position={point} />`, but a retained state object is preferred for frequently updated or performance-sensitive overlays:

```tsx
const [markerState] = useState(() =>
  createMarkerState({
    id: 'marker',
    position: initialPosition,
    draggable: true,
  })
);

return <Marker state={markerState} />;
```

For large collections, use `<Markers states={states} />` instead of rendering one `<Marker>` component per item.

## React Native map setup

Provider view-state hooks retain their state internally:

```tsx
const googleState = useGoogleMapViewState({
  id: 'google-map',
  mapDesignType: GoogleMapDesign.Normal,
  cameraPosition,
});

const mapLibreState = useMapLibreViewState({
  id: 'maplibre-map',
  mapDesignType: MapLibreDesign.DemoTiles,
  cameraPosition,
});

const mapState = provider === 'google-maps' ? googleState : mapLibreState;

return (
  <MapViewContainer state={mapState}>
    <Marker state={markerState} />
  </MapViewContainer>
);
```

The example provider switch is implemented in `examples/reactnative-basic/src/pages/MapViewContainer.tsx`. JSX overlays may be declared before `onMapLoaded`; provider controllers queue pending compositions until the map is ready. Do not add page-level readiness gates merely to make ordinary overlays appear.

## GroundImage

React Native GroundImage supports Google Maps and MapLibre Android. Its state is registered through the shared overlay collector, serialized by the provider controller, converted to the Android SDK `GroundImageState`, and rendered by the provider's existing ground-image controller.

```tsx
const [groundImageState] = useState(() =>
  createGroundImageState({
    id: 'groundImage',
    bounds: createGeoRectBounds({ southWest, northEast }),
    imageUrl: 'android.resource://com.example.app/drawable/ground_image',
    opacity: 0.5,
    onClick: (event) => {
      console.log(event.clicked);
    },
  })
);

groundImageState.opacity = 0.8;
groundImageState.bounds = nextBounds;
groundImageState.imageUrl = nextImageUrl;

return <GroundImage state={groundImageState} />;
```

The Android bridge currently decodes `android.resource:`, `content:`, `file:`, and `data:image` URIs. Decoded images and Drawables are cached by URI so an opacity or bounds update does not decode the image again.

The React Native example mirrors the Android SDK Newark 1922 sample: draggable southwest/northeast markers update the bounds, clicking the image switches the resource, and a slider updates opacity. See `examples/reactnative-basic/src/pages/groundimage/GroundImagePage.tsx`.

## RasterLayer

RasterLayer accepts `UrlTemplate`, `TileJson`, and `ArcGisService` sources supported by `RasterLayerSource`.

```tsx
const source = RasterLayerSource.UrlTemplate({
  template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileSize: 256,
});

const [rasterLayerState] = useState(() =>
  createRasterLayerState({
    id: 'rasterLayer',
    source,
    opacity: 1,
  })
);

rasterLayerState.opacity = 0.5;

return <RasterLayer state={rasterLayerState} />;
```

Ordinary raster layers and extension-owned raster layers share the provider's native raster-layer collector. Composition and clear operations must remove only the caller's layers and must preserve layers owned by extensions such as marker tiling.

The matching React Native example is `examples/reactnative-basic/src/pages/rasterlayer/RasterLayerPage.tsx`.

## React Native Android architecture

Ordinary marker transport follows:

```text
JS MarkerState
  -> React Native batch bridge
  -> provider wrapper
  -> Android SDK provider controller
  -> Android SDK core
  -> Google Maps or MapLibre SDK
```

Do not route ordinary markers through Compose. The Compose host inside a provider wrapper is reserved for overlays and native extensions that still require the shared collector host, including heatmap and marker clustering.

Native extensions use the generic `NativeMapExtensionCapable` boundary. Do not add extension-specific commands to the public Google Maps or MapLibre controller interfaces.

Large marker compositions use one icon dictionary per generation, batches of 500 marker records, an ACK after each batch, and a final commit. Keep bridge decoding and large state construction off the main thread.

## Examples

React Native examples live in `examples/reactnative-basic/src/pages`. Overlay examples use retained state objects and render components with `state={...}`. When adding or updating an example:

- Use `MapViewContainer` for provider switching.
- Retain provider view states and overlay states.
- Update observable state properties directly from sliders, drag handlers, and click handlers.
- Use `<Markers states={states} />` for large immutable marker collections.
- Keep behavior comparable between Google Maps and MapLibre.
- Do not hide overlay lifecycle problems behind an `onMapLoaded` gate.

## Verification

Typical checks for React Native Android changes are:

```bash
npm run build --workspace @mapconductor/js-sdk-react
npm run build --workspace @mapconductor/react-for-googlemaps
npm run build --workspace @mapconductor/react-for-maplibre
npx tsc --noEmit --ignoreDeprecations 5.0 -p examples/reactnative-basic/tsconfig.json
npx eslint examples/reactnative-basic/src/pages --ext .ts,.tsx
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew \
    :android:mapconductor_js-sdk-react:compileDebugKotlin \
    :android:mapconductor_react-for-googlemaps:compileDebugKotlin \
    :android:mapconductor_react-for-maplibre:compileDebugKotlin \
    :android:app:compileDebugKotlin
```

Provider and shared packages can be nested Git worktrees or submodules. Run `git -C <package> diff --check` in addition to the root check.
