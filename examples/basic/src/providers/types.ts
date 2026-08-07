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
   * MapViewContainer converts this into a `CameraRestriction` and applies it to
   * the shared singleton instance at runtime, clearing it when the page
   * unmounts — so it never leaks into other pages for that provider.
   */
  restrictBounds?: GeoRectBounds;
}
