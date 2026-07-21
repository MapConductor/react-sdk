import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type {
  GeoPoint,
  GeoRectBounds,
  MapCameraPosition,
  MapDesignTypeInterface,
  MapViewStateInterface,
  MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import { type InitialCamera, DEFAULT_CAMERA } from './common';
import { SingletonMapSlot, useSingletonMapState, type SingletonMapId } from './SingletonMaps';
import { useInitialCameraPosition } from './providers/useInitialCameraPosition';
import type { ProviderViewProps } from './providers/types';

export type { InitialCamera };
export { DEFAULT_CAMERA };

// Every provider is normally driven by a singleton map instance (see
// SingletonMaps.tsx) that's mounted once at the app root and kept alive
// across navigation, so switching pages never destroys/recreates the map.
// The one exception is restrictBounds: it's baked in once at map creation
// and can't vary per page on a shared instance, so pages that need a
// page-specific restrictBounds (currently only PolygonHolePage) fall back to
// a dedicated, per-mount instance via the lazy Provider views below.
const LazyLeafletProviderView = lazy(() => import('./providers/LeafletProviderView'));
const LazyOpenLayersProviderView = lazy(() => import('./providers/OpenLayersProviderView'));
const LazyMapLibreProviderView = lazy(() => import('./providers/MapLibreProviderView'));
const LazyMapBoxProviderView = lazy(() => import('./providers/MapboxProviderView'));
const LazyArcGISProviderView = lazy(() => import('./providers/ArcGISProviderView'));
const LazyCesiumProviderView = lazy(() => import('./providers/CesiumProviderView'));
const LazyHereProviderView = lazy(() => import('./providers/HereProviderView'));

interface MapViewContainerProps {
  children?: ReactNode;
  initialCamera?: InitialCamera;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
  markerTilingOptions?: MarkerTilingOptions;
  onStateReady?: (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => void;
  /**
   * Restricts panning/zooming so the viewport cannot leave this rectangle.
   * Forces a dedicated (non-singleton) map instance for the active provider,
   * since a shared singleton instance can't have a page-specific restriction
   * baked in without leaking it into every other page for that provider.
   * Not applied on Google Maps, which always uses the singleton instance.
   */
  restrictBounds?: GeoRectBounds;
}

function MapLoadingPlaceholder() {
  return (
    <div className="sample-map-placeholder" role="status">
      Loading map…
    </div>
  );
}

function SingletonProviderView({
  id,
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  onStateReady,
}: ProviderViewProps & { id: SingletonMapId }) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useSingletonMapState(id, cameraPosition);

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <SingletonMapSlot
      id={id}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </SingletonMapSlot>
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
  restrictBounds,
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
  const isHere = location.pathname.startsWith('/here');
  const useDedicatedInstance = Boolean(restrictBounds);

  const commonProps: ProviderViewProps = {
    children,
    initialCamera,
    onMapClick,
    onCameraMoveStart,
    onCameraMove,
    onCameraMoveEnd,
    markerTilingOptions,
    onStateReady,
    restrictBounds,
  };

  switch (true) {
    case isGoogle3D || isGoogle2D: {
      return <SingletonProviderView id={isGoogle3D ? 'google-3d' : 'google-2d'} {...commonProps} />;
    }

    case isLeaflet: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyLeafletProviderView {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id="leaflet" {...commonProps} />;
    }

    case isOpenLayers: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyOpenLayersProviderView {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id="openlayers" {...commonProps} />;
    }

    case isMapLibre3D || isMapLibre2D: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyMapLibreProviderView useGlobe={isMapLibre3D} {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id={isMapLibre3D ? 'maplibre-3d' : 'maplibre-2d'} {...commonProps} />;
    }

    case isMapbox: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyMapBoxProviderView {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id="mapbox" {...commonProps} />;
    }

    case isArcGIS3D || isArcGIS2D: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyArcGISProviderView useSceneView={isArcGIS3D} {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id={isArcGIS3D ? 'arcgis-3d' : 'arcgis-2d'} {...commonProps} />;
    }

    case isCesium: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyCesiumProviderView {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id="cesium" {...commonProps} />;
    }

    case isHere: {
      if (useDedicatedInstance) {
        return (
          <Suspense fallback={<MapLoadingPlaceholder />}>
            <LazyHereProviderView {...commonProps} />
          </Suspense>
        );
      }
      return <SingletonProviderView id="here" {...commonProps} />;
    }

    default: {
      return (
        <div>No provider can be detected</div>
      );
    }
  }
}
