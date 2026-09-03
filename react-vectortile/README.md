# @mapconductor/react-vectortile

Draws a MapLibre vector style on any MapConductor backend, by rendering it to
raster tiles in the browser and serving them through the SDK's local tile
server. The backend only ever sees an ordinary raster layer — which is what
makes this work on Google Maps, MapKit, Cesium, OpenLayers and the rest, none of
which can render a vector style themselves.

```tsx
import { VectorTileLayer } from '@mapconductor/react-vectortile';

<MapView>
    <VectorTileLayer
        style="https://tiles.versatiles.org/assets/styles/colorful/style.json"
        opacity={0.9}
        onDiagnostics={(messages) => console.warn(messages)}
    />
</MapView>;
```

## Notes

- **Rendering runs in a Web Worker**, so a viewport's worth of tiles does not
  stall the map. A 12-tile burst blocks the main thread for ~5 ms; rendering
  in-process blocks it for the full render time.
- **The tile service worker must be reachable** at `/tile-sw.js`, the same
  requirement `@mapconductor/react-heatmap` has. `VectorTileLayer` registers it
  and waits for it to take control before serving.
- **Symbol layers are not drawn.** Label placement needs collision detection
  that stays consistent across tile boundaries, which per-tile rendering cannot
  do. `onDiagnostics` reports this and anything else about the style worth
  knowing — a style this renderer cannot use says so rather than silently
  producing blank tiles.
- The renderer itself is a Rust core shared with the Android and iOS modules,
  vendored under `vendor/`. It is built and synced from the
  `mapconductor-vectortile` repo; do not edit it here.
