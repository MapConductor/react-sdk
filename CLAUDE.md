# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

MapConductor React SDK is a unified mapping library that provides a common API for multiple map providers (Google Maps, MapLibre, etc.). The project follows a monorepo architecture with a core module and provider-specific implementations.

## Build and Development Commands

### Installing Dependencies
```bash
npm install
```

### Building All Packages
```bash
npm run build
```

This will build all packages in the workspaces.

### Development Mode
```bash
npm run dev
```

Watches for changes and rebuilds packages automatically.

### Linting
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Running Tests
```bash
npm run test
```

### Running Example App
```bash
cd examples/basic
npm install
npm run dev
```

## Module Architecture

### Core Module (`@mapconductor/js-sdk-core`)
- **Purpose**: Contains shared abstractions, types, and React functionality
- **Key Components**:
  - `MapController`: Abstract controller interface for all map providers
  - `MapProvider`: Base class for provider implementations
  - React hooks: `useMapController`, `useCamera`, `useMarkers`
  - Types: `GeoPoint`, `MapCameraPosition`, overlay types

### Provider-Specific Modules
Each map provider has its own package that implements the core abstractions:

- **`@mapconductor/react-for-googlemaps`**: Google Maps implementation
  - `GoogleMapsController`: Implements MapController using Google Maps API
  - `GoogleMapsProvider`: Provider implementation
  - `GoogleMapsView`: React component

- **`@mapconductor/react-for-maplibre`**: MapLibre GL implementation
  - `MapLibreController`: Implements MapController using MapLibre
  - `MapLibreProvider`: Provider implementation
  - `MapLibreView`: React component

### Example Applications
- **`examples/basic`**: Basic example showing how to use both providers

## Key Design Patterns

### Provider Pattern
Each map library has its own provider that implements the `MapController` interface. This allows switching between different map providers without changing the application code.

### React Context
The `MapContext` is used to share the map controller instance across components within a map view.

### Custom Hooks
- `useMapController()`: Access the map controller instance
- `useCamera()`: Control camera position and movement
- `useMarkers()`: Declaratively manage markers
- `useMapReady()`: Check if map is initialized

### TypeScript
The project is fully typed with TypeScript for type safety across all providers.

## Configuration Files

### Root `package.json`
Defines workspaces and shared development dependencies. Uses npm workspaces for monorepo management.

### `tsconfig.json`
Base TypeScript configuration shared by all packages.

### Package-specific configs
Each package has its own:
- `package.json`: Dependencies and build scripts
- `tsconfig.json`: Extends root config
- `tsup` for building (configured in package.json scripts)

## Feature Implementation Status

Currently implemented:
- Map initialization and configuration
- Camera control (move, animate, fitBounds)
- Markers
- Circles
- Polylines
- Polygons
- Ground overlays (Google Maps only)
- Event handlers

## Development Guidelines

1. **New Features**: Implement in core first, then in each provider module
2. **Type Safety**: Always use TypeScript types, avoid `any`
3. **Consistent API**: Maintain API consistency across all providers
4. **Documentation**: Update README when adding new features
5. **Examples**: Add examples for new features in the example app

## Provider Implementation Notes

### Google Maps
- Uses `@googlemaps/js-api-loader` for API loading
- Native Google Maps objects wrapped by controller
- Supports all overlay types

### MapLibre
- Uses `maplibre-gl` npm package
- Overlays implemented using sources and layers (except markers)
- Requires importing CSS separately
- Ground overlays not supported (use raster layers instead)

## Common Tasks

### Adding a New Provider
1. Create new package directory: `packages/[provider-name]/`
2. Implement `MapController` interface
3. Create provider class extending `MapProvider`
4. Create React view component
5. Add to workspaces in root `package.json`
6. Update README with new provider

### Adding a New Feature
1. Add types to `@mapconductor/js-sdk-core/src/types/`
2. Update `MapController` interface
3. Implement in each provider's controller
4. Create hook if needed in `@mapconductor/js-sdk-core/src/react/hooks/`
5. Update documentation and examples

### Testing Changes
1. Build packages: `npm run build`
2. Run example app: `cd examples/basic && npm run dev`
3. Test with both providers
4. Check TypeScript compilation
5. Run linter

## Architecture Diagram

```
┌─────────────────────────────────────┐
│     Application Code                │
│  (Uses MapConductor Components)     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│    @mapconductor/js-sdk-core        │
│  - MapController interface          │
│  - React hooks and context          │
│  - Common types (GeoPoint, etc.)    │
└─────────────┬───────────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   Google    │ │   MapLibre  │
│   Maps      │ │             │
│  Provider   │ │  Provider   │
└──────┬──────┘ └──────┬──────┘
       │               │
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│   Google    │ │  MapLibre   │
│   Maps API  │ │   GL JS     │
└─────────────┘ └─────────────┘
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clean and rebuild: `npm run clean && npm run build`
- Check for TypeScript errors: `npm run lint`

### Example App Issues
- Verify packages are built: `npm run build` in root
- Check API keys are configured (for Google Maps)
- Clear browser cache and restart dev server

### Type Errors
- Ensure `@mapconductor/js-sdk-core` is built before building providers
- Check `tsconfig.json` references are correct
- Run `npm run build` from root to build all packages in order
