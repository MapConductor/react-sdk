import type { GeoPoint, MapCameraPosition } from '@mapconductor/js-sdk-core';
import type { ReactNode } from 'react';

export interface SingletonMapContent {
  owner: string;
  children?: ReactNode;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
}
