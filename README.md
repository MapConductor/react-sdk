# MapConductor React SDK

A unified mapping library for React that provides a common API for multiple map providers. Write once, deploy across Google Maps, MapLibre, and other major mapping platforms.

## Features

- **🗺️ Multi-Provider Support**: Seamlessly switch between Google Maps, MapLibre, and other map providers with a single API
- **🎯 Unified Interface**: Common abstractions for markers, circles, polylines, polygons, and ground overlays
- **⚡ High Performance**: Built with React 18+ and TypeScript for optimal performance
- **🔄 Reactive**: Modern React hooks for easy state management
- **📦 Modular**: Install only the providers you need

## Architecture

### Module Structure

This project uses a monorepo structure with the following packages:

- **`@mapconductor/js-sdk-core`**: Core abstractions, types, and React hooks
- **`@mapconductor/google-maps`**: Google Maps implementation
- **`@mapconductor/maplibre`**: MapLibre GL implementation

### Key Components

- **MapController**: Abstract controller interface for all map providers
- **MapView Components**: Provider-specific React components (GoogleMapsView, MapLibreView)
- **React Hooks**: useCamera, useMarkers, useMapController, and more
- **Type System**: Comprehensive TypeScript definitions for all features

## Quick Start

### Installation

Install the core package and your desired map provider(s):

```bash
# Core package (required)
npm install @mapconductor/js-sdk-core

# Google Maps provider
npm install @mapconductor/google-maps

# MapLibre provider
npm install @mapconductor/maplibre
```

### Basic Usage with MapLibre

```tsx
import { MapLibreView } from '@mapconductor/maplibre';
import { useMarkers } from '@mapconductor/js-sdk-core';
import '@mapconductor/maplibre/style.css';

function MapComponent() {
  const markers = [
    {
      position: { latitude: 35.6762, longitude: 139.6503 },
      title: 'Tokyo',
    },
  ];

  return (
    <MapLibreView
      center={[139.6503, 35.6762]}
      zoom={10}
      style="https://demotiles.maplibre.org/style.json"
    >
      <MapContent markers={markers} />
    </MapLibreView>
  );
}

function MapContent({ markers }) {
  useMarkers(markers);
  return null;
}
```

### Basic Usage with Google Maps

```tsx
import { GoogleMapsView } from '@mapconductor/google-maps';
import { useMarkers } from '@mapconductor/js-sdk-core';

function MapComponent() {
  const markers = [
    {
      position: { latitude: 35.6762, longitude: 139.6503 },
      title: 'Tokyo',
    },
  ];

  return (
    <GoogleMapsView
      apiKey="YOUR_API_KEY"
      center={{ lat: 35.6762, lng: 139.6503 }}
      zoom={10}
    >
      <MapContent markers={markers} />
    </GoogleMapsView>
  );
}

function MapContent({ markers }) {
  useMarkers(markers);
  return null;
}
```

### Switch Map Providers

Simply change the map view component to switch providers:

```tsx
// MapLibre
<MapLibreView {...props}>
  <MapContent />
</MapLibreView>

// Google Maps
<GoogleMapsView {...props}>
  <MapContent />
</GoogleMapsView>
```

## Core API

### Types

#### GeoPoint

```typescript
interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
}
```

#### MapCameraPosition

```typescript
interface MapCameraPosition {
  center: GeoPoint;
  zoom: number;
  bearing?: number;
  pitch?: number;
}
```

### Overlays

#### Markers

```typescript
import { useMarkers } from '@mapconductor/js-sdk-core';

const markers = [
  {
    id: 'marker-1',
    position: { latitude: 35.6762, longitude: 139.6503 },
    title: 'Tokyo',
    clickable: true,
    draggable: false,
  },
];

useMarkers(markers);
```

#### Circles

```typescript
const controller = useMapController();

controller.addCircle({
  center: { latitude: 35.6762, longitude: 139.6503 },
  radius: 1000, // meters
  fillColor: '#3388ff',
  fillOpacity: 0.4,
  strokeColor: '#3388ff',
  strokeWidth: 2,
});
```

#### Polylines

```typescript
controller.addPolyline({
  path: [
    { latitude: 35.6762, longitude: 139.6503 },
    { latitude: 34.0522, longitude: -118.2437 },
  ],
  strokeColor: '#ff0000',
  strokeWidth: 3,
  geodesic: true,
});
```

#### Polygons

```typescript
controller.addPolygon({
  path: [
    { latitude: 35.6762, longitude: 139.6503 },
    { latitude: 35.6762, longitude: 140.6503 },
    { latitude: 34.6762, longitude: 140.6503 },
    { latitude: 34.6762, longitude: 139.6503 },
  ],
  fillColor: '#00ff00',
  fillOpacity: 0.3,
  strokeColor: '#00ff00',
  strokeWidth: 2,
});
```

### Hooks

#### useMapController

Access the map controller to programmatically control the map:

```typescript
import { useMapController } from '@mapconductor/js-sdk-core';

function MapControls() {
  const controller = useMapController();

  const addMarker = () => {
    controller?.addMarker({
      position: { latitude: 35.6762, longitude: 139.6503 },
      title: 'New Marker',
    });
  };

  return <button onClick={addMarker}>Add Marker</button>;
}
```

#### useCamera

Control the map camera:

```typescript
import { useCamera } from '@mapconductor/js-sdk-core';

function CameraControls() {
  const { moveCamera, animateCamera, fitBounds } = useCamera();

  const flyToTokyo = () => {
    animateCamera(
      {
        center: { latitude: 35.6762, longitude: 139.6503 },
        zoom: 12,
      },
      { duration: 1000 }
    );
  };

  return <button onClick={flyToTokyo}>Fly to Tokyo</button>;
}
```

#### useMarkers

Declaratively manage markers:

```typescript
import { useMarkers } from '@mapconductor/js-sdk-core';

function MarkerLayer({ locations }) {
  const markers = locations.map((loc) => ({
    position: loc.coordinates,
    title: loc.name,
  }));

  useMarkers(markers);

  return null;
}
```

## Development

### Initial Setup

**Important**: This project uses a monorepo structure with local package dependencies. See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start with npm:

```bash
# Install and link all packages
npm install

# Build all packages
npm run build
```

### Building the Project

```bash
# Build all packages
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

### Running the Example App

```bash
cd examples/basic
npm run dev
```

Open http://localhost:3000 to view the example app.

### Project Structure

```
react-sdk/
├── packages/
│   ├── core/                 # Core types and abstractions
│   │   ├── src/
│   │   │   ├── types/        # GeoPoint, MapCamera, overlays
│   │   │   ├── controller/   # MapController interface
│   │   │   ├── provider/     # MapProvider base class
│   │   │   └── react/        # React hooks and context
│   │   └── package.json
│   ├── google-maps/          # Google Maps provider
│   │   ├── src/
│   │   │   ├── GoogleMapsController.ts
│   │   │   ├── GoogleMapsProvider.ts
│   │   │   └── GoogleMapsView.tsx
│   │   └── package.json
│   └── maplibre/             # MapLibre provider
│       ├── src/
│       │   ├── MapLibreController.ts
│       │   ├── MapLibreProvider.ts
│       │   └── MapLibreView.tsx
│       └── package.json
├── examples/
│   └── basic/                # Example application
└── package.json
```

## Feature Implementation Status

|                 | Google Maps | MapLibre |
|-----------------|-------------|----------|
| Map             | ✅          | ✅       |
| Marker          | ✅          | ✅       |
| Circle          | ✅          | ✅       |
| Polyline        | ✅          | ✅       |
| Polygon         | ✅          | ✅       |
| GroundOverlay   | ✅          | ❌       |
| Event Handlers  | ✅          | ✅       |
| Camera Control  | ✅          | ✅       |

## API Keys

### Google Maps

1. Get an API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Use the key in your GoogleMapsView component

### MapLibre

MapLibre is open source and doesn't require an API key. You can use any MapLibre-compatible style URL.

Popular style providers:
- **MapTiler**: https://www.maptiler.com/
- **Maptiler Demo**: https://demotiles.maplibre.org/style.json
- **OpenStreetMap**: Various community styles available

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Related Projects

- [MapConductor Android SDK](https://github.com/MapConductor/android-sdk) - The Android version of this SDK
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [MapLibre GL JS](https://maplibre.org/)

## Support

For issues and questions:
- GitHub Issues: https://github.com/MapConductor/react-sdk/issues
- Documentation: https://github.com/MapConductor/react-sdk/docs
