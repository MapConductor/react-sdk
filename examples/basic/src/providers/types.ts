import type { ReactNode } from 'react';
import type {
  GeoPoint,
  GeoRectBounds,
  MapCameraPosition,
  MapDesignTypeInterface,
  MapViewStateInterface,
  MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import type { InitialCamera } from '../common';

export interface ProviderViewProps {
  children?: ReactNode;
  initialCamera: InitialCamera;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
  markerTilingOptions?: MarkerTilingOptions;
  onStateReady?: (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => void;
  /**
   * Restricts panning/zooming so the viewport cannot leave this rectangle.
   * Providers normally share one singleton map instance app-wide (see
   * SingletonMaps.tsx), so a page-specific restriction would leak into every
   * other page for that provider. MapViewContainer only honors this by
   * falling back to a dedicated (non-singleton) instance for the active
   * provider; it's still ignored on Google Maps, which always uses the
   * singleton instance.
   */
  restrictBounds?: GeoRectBounds;
}
