import { useEffect, useMemo, type ReactNode } from 'react';
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

// Every provider is driven by a singleton map instance (see SingletonMaps.tsx)
// that's mounted once at the app root and kept alive across navigation, so
// switching pages never destroys/recreates the map.
//
// restrictBounds used to be the one exception — it was baked in at map creation
// and couldn't vary per page on a shared instance, so pages needing it fell back
// to a dedicated per-mount instance. The SDK now applies the restriction at
// runtime through `setCameraRestriction`, so the shared instance handles it and
// every page goes through the singleton path.
//
// The per-provider `*ProviderView` components that existed only to serve that
// fallback are gone with it.

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
   * Applied to the shared singleton instance at runtime and cleared when the
   * page unmounts, so it never leaks into other pages for that provider.
   */
  restrictBounds?: GeoRectBounds;
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
  restrictBounds,
}: ProviderViewProps & { id: SingletonMapId }) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useSingletonMapState(id, cameraPosition);
  // The SDK normalizes `restrictBounds` / `minZoom` / `maxZoom` into a single
  // CameraRestriction, so a page that only needs a rectangle can pass just that.
  const cameraRestriction = useMemo(
    () => (restrictBounds ? { bounds: restrictBounds } : null),
    [restrictBounds],
  );

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
      cameraRestriction={cameraRestriction}
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
  const isMapKit = location.pathname.startsWith('/mapkit');
  const isAzureMaps = location.pathname.startsWith('/azuremaps');
  const isCesium = location.pathname.startsWith('/cesium');
  const isHere = location.pathname.startsWith('/here');
  const isTomTom = location.pathname.startsWith('/tomtom');
  const isMapTiler = location.pathname.startsWith('/maptiler');
  const isLongdo = location.pathname.startsWith('/longdo');

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
      return <SingletonProviderView id="leaflet" {...commonProps} />;
    }

    case isOpenLayers: {
      return <SingletonProviderView id="openlayers" {...commonProps} />;
    }

    case isMapLibre3D || isMapLibre2D: {
      return <SingletonProviderView id={isMapLibre3D ? 'maplibre-3d' : 'maplibre-2d'} {...commonProps} />;
    }

    case isMapbox: {
      return <SingletonProviderView id="mapbox" {...commonProps} />;
    }

    case isArcGIS3D || isArcGIS2D: {
      return <SingletonProviderView id={isArcGIS3D ? 'arcgis-3d' : 'arcgis-2d'} {...commonProps} />;
    }

    case isMapKit: {
      return <SingletonProviderView id="mapkit" {...commonProps} />;
    }

    case isAzureMaps: {
      return <SingletonProviderView id="azuremaps" {...commonProps} />;
    }

    case isCesium: {
      return <SingletonProviderView id="cesium" {...commonProps} />;
    }

    case isHere: {
      return <SingletonProviderView id="here" {...commonProps} />;
    }

    case isTomTom: {
      return <SingletonProviderView id="tomtom" {...commonProps} />;
    }

    case isMapTiler: {
      return <SingletonProviderView id="maptiler" {...commonProps} />;
    }

    case isLongdo: {
      return <SingletonProviderView id="longdo" {...commonProps} />;
    }

    default: {
      return (
        <div>No provider can be detected</div>
      );
    }
  }
}
