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

## Limits

Symbol layers are not drawn — placing labels without collisions requires seeing
what neighbouring tiles placed, which a tile rendered on its own cannot know.
`onDiagnostics` reports this along with anything else about the style that will
not render as intended.
