English | [日本語](./README.ja.md) | [Español (Latinoamérica)](./README.es-419.md)

# @mapconductor/react-kml

KML layer extension for the MapConductor React SDK. Parses OGC KML 2.2
documents (and KMZ archives) into feature models and renders them as a tiled
overlay inside any provider map view (`react-for-googlemaps`,
`react-for-maplibre`, `react-for-here`, …), with KML styling and click
hit-testing. It shares the tile-rendering architecture of
`@mapconductor/react-geojson-layer`, so it scales to large KML datasets.

React Native support is not yet available — this package is web-only for now.

## Features

- Parses `Point`, `LineString`, `LinearRing`, `Polygon` (with
  `innerBoundaryIs` holes), and `MultiGeometry`.
- Reads KMZ archives transparently: ZIP input is detected by signature and the
  first `.kml` entry (conventionally `doc.kml`) is used as the document.
- Traverses nested `<Document>` and `<Folder>` containers with a loop and a
  depth counter — never recursion — so arbitrarily deep hierarchies cannot
  overflow the call stack.
- Follows `<NetworkLink>` references (KML documents hosted elsewhere on the
  internet) through `KMLLoader`, with relative-href resolution, cycle
  detection, and a document-count cap.
- Resolves KML styling: `LineStyle` (color, width), `PolyStyle` (color, fill,
  outline), and `IconStyle` (color), including shared `<Style>` / `<StyleMap>`
  references via `styleUrl`. KML `aabbggrr` colors are converted to ARGB ints.
- Reads `<name>`, `<description>`, and `<ExtendedData>` (`Data`/`SchemaData`)
  into feature properties.
- Supports static bulk features with `KMLFeatureData` and reactive features
  with `KMLFeatureState`, `KMLFeature`, and `KMLFeatures`.
- Supports layer-level and feature-level styling with a pluggable
  `KMLStyleProviderInterface`.
- Provides click hit-testing through `KMLLayerState.processClick`.

## Installation

```shell
npm install @mapconductor/react-kml
```

`@mapconductor/js-sdk-core` and `@mapconductor/js-sdk-react` are installed
automatically as dependencies. You also need a provider package (any
`@mapconductor/react-for-*`) to host the map view.

## Quick start

```tsx
import { KMLLayer, KMLLayerState, KMLParser } from '@mapconductor/react-kml';

const layerState = new KMLLayerState({
  onClick: (feature, position) => console.log(feature.properties, position),
});

const features = KMLParser.parse(kmlText);

<MapView state={mapViewState}>
  <KMLLayer state={layerState} features={features} />
</MapView>;
```

To follow `<NetworkLink>` references, load through `KMLLoader` instead:

```ts
import { KMLLoader } from '@mapconductor/react-kml';

const loader = new KMLLoader();
const features = await loader.load('https://example.com/doc.kml');
```

## License

Apache License 2.0
