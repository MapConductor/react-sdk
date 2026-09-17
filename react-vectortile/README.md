# @mapconductor/react-vectortile

Renders a MapLibre vector style as raster tiles, so any MapConductor backend can
display one — including the several that cannot read a vector style at all
(Google Maps, MapKit, HERE, ArcGIS, Cesium).

This package is a thin React component. The renderer itself is
[`@mapconductor/vectortile`](../vectortile), which has **no framework
dependency and no runtime dependencies**; use that directly from Vue, Svelte, or
plain JavaScript.

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

## Props

| prop | default | |
| --- | --- | --- |
| `style` | — | A `style.json` URL, its raw text, or the parsed object. |
| `tileSize` | `512` | Output tile size in pixels. |
| `opacity` | `1` | |
| `visible` | `true` | |
| `maxZoom` | `22` | |
| `headers` | — | Sent with every source tile request — auth tokens, API keys. |
| `onDiagnostics` | — | Reasons the style may not render as intended. |

## Restyling

Passing a new `style` recolours in place: the vector tiles already fetched are
reused and only the rasterisation is redone, so a palette change costs no
network traffic. `examples/basic` has a page that does this with colour pickers.

`style` is compared by content, not object identity, so building it inline —
which is what a colour picker does — is safe.

## Requirements

The tile service worker must be reachable at `/tile-sw.js`, the same requirement
`@mapconductor/react-heatmap` has. `VectorTileLayer` registers it and waits for
it to control the page before requesting a tile. Service workers need a secure
context: `localhost` over plain HTTP is fine, but LAN access needs HTTPS.

## How it draws

Two raster layers are mounted, not one:

- the **ground** — fills, lines and circles, the half no font arriving can change
- a transparent **label overlay** above it, replaced on its own when glyph ranges land

To the map and the user they read as one map. The halves render in parallel, and
a glyph range landing redraws only the transparent one, so a label appearing
never blanks the map beneath it. Replacing a raster layer's URL is
remove-then-add, so the replacement is mounted alongside its predecessor and the
old one dropped a moment later — a handover rather than a gap.

Attribution is handled for you: the credits the style's sources ask for are
attached to both layers, so they appear in the map's attribution overlay without
the host writing any UI and disappear when the layer unmounts. A basemap drawing
OpenStreetMap requires the credit, so this is not cosmetic.

## Limits

`onDiagnostics` reports layer types the renderer will not draw, sources it
cannot fetch, and Mapbox `imports` — anything about the style that will not
render as intended. The failure mode that matters is a blank tile, so it is
worth surfacing.

## License

Apache License 2.0. See [LICENSE](./LICENSE).
