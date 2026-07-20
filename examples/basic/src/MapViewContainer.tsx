import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type {
  GeoPoint,
  MapCameraPosition,
  MapDesignTypeInterface,
  MapViewStateInterface,
  MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import { type InitialCamera, DEFAULT_CAMERA } from './common';
import {
  SingletonGoogleMapSlot,
  useSingletonGoogleMapViewState,
} from './SingletonGoogleMaps';
import { useInitialCameraPosition } from './providers/useInitialCameraPosition';
import type { ProviderViewProps } from './providers/types';

export type { InitialCamera };
export { DEFAULT_CAMERA };

// Each provider SDK (maplibre-gl, mapbox-gl, leaflet, ol, @arcgis/core, cesium) is
// large, so these are loaded on demand instead of being bundled into one chunk with
// every other provider. Google Maps is the exception: it's driven by a singleton
// context (see SingletonGoogleMaps.tsx) that's already mounted eagerly at the app
// root to keep the map instance alive across navigation, and its SDK is small.
const LazyLeafletProviderView = lazy(() => import('./providers/LeafletProviderView'));
const LazyOpenLayersProviderView = lazy(() => import('./providers/OpenLayersProviderView'));
const LazyMapLibreProviderView = lazy(() => import('./providers/MapLibreProviderView'));
const LazyMapboxProviderView = lazy(() => import('./providers/MapboxProviderView'));
const LazyArcGISProviderView = lazy(() => import('./providers/ArcGISProviderView'));
const LazyCesiumProviderView = lazy(() => import('./providers/CesiumProviderView'));

interface MapViewContainerProps {
  children?: ReactNode;
  initialCamera?: InitialCamera;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
  markerTilingOptions?: MarkerTilingOptions;
  onStateReady?: (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => void;
}

function MapLoadingPlaceholder() {
  return (
    <div className="sample-map-placeholder" role="status">
      Loading map…
    </div>
  );
}

function GoogleProviderView({
  mode,
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  onStateReady,
}: ProviderViewProps & { mode: '2d' | '3d' }) {
  // Google Maps marker tiling is fixed at the singleton-host level because it is
  // constructor configuration. MapLibre can still configure it per page.
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useSingletonGoogleMapViewState(cameraPosition);

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <SingletonGoogleMapSlot
      mode={mode}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </SingletonGoogleMapSlot>
  );
}

export function MapViewContainer({
  children,
  initialCamera = DEFAULT_CAMERA,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  onStateReady,
}: MapViewContainerProps) {
  const location = useLocation();
  const isGoogle3D = location.pathname.startsWith('/google-maps-3d');
  const isGoogle2D = !isGoogle3D && location.pathname.startsWith('/google-maps');
  const isLeaflet = location.pathname.startsWith('/leaflet');
  const isOpenLayers = location.pathname.startsWith('/openlayers');
  const isMapbox = location.pathname.startsWith('/mapbox');
  const isMapLibre3D = location.pathname.startsWith('/maplibre-3d');
  const isMapLibre2D = !isMapLibre3D && location.pathname.startsWith('/maplibre');
  const isArcGIS3D = location.pathname.startsWith('/arcgis-3d');
  const isArcGIS2D = !isArcGIS3D && location.pathname.startsWith('/arcgis');
  const isCesium = location.pathname.startsWith('/cesium');

  const commonProps: ProviderViewProps = {
    children,
    initialCamera,
    onMapClick,
    onCameraMoveStart,
    onCameraMove,
    onCameraMoveEnd,
    markerTilingOptions,
    onStateReady,
  };

  switch (true) {
    case isGoogle3D || isGoogle2D: {
      return <GoogleProviderView mode={isGoogle3D ? '3d' : '2d'} {...commonProps} />;
    }

    case isLeaflet: {
      return (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <LazyLeafletProviderView {...commonProps} />
        </Suspense>
      );
    }

    case isOpenLayers: {
      return (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <LazyOpenLayersProviderView {...commonProps} />
        </Suspense>
      );
    }

    case isMapLibre3D || isMapLibre2D: {
      return (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <LazyMapLibreProviderView projection={isMapLibre3D ? 'globe' : 'mercator'} {...commonProps} />
        </Suspense>
      );
    }

    case isMapbox: {
      return (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <LazyMapboxProviderView {...commonProps} />
        </Suspense>
      );
    }

    case isArcGIS3D || isArcGIS2D: {
      return (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <LazyArcGISProviderView useSceneView={isArcGIS3D} {...commonProps} />
        </Suspense>
      );
    }

    case isCesium: {
      return (
        <Suspense fallback={<MapLoadingPlaceholder />}>
          <LazyCesiumProviderView {...commonProps} />
        </Suspense>
      );
    }

    default: {
      return (
        <div>No provider can be detected</div>
      );
    }
  }
}
