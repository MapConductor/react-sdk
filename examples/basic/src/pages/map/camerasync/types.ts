import type {
  GeoPoint,
  MapCameraPosition,
  MapDesignTypeInterface,
  MapViewStateInterface,
} from '@mapconductor/js-sdk-core';

export type PaneId = 'left' | 'right';

export type PaneProvider =
  | 'maplibre'
  | 'mapbox'
  | 'mapbox-3d'
  | 'leaflet'
  | 'openlayers'
  | 'google-maps'
  | 'google-maps-3d'
  | 'arcgis'
  | 'arcgis-3d'
  | 'cesium'
  | 'here';

export interface CameraLocationInfo {
  name: string;
  bounds: {
    southWest: GeoPoint;
    northEast: GeoPoint;
  };
  center: GeoPoint;
  zoom: number;
}

export interface ProgrammaticMoveState {
  key: number | null;
  target: MapCameraPosition | null;
  untilMs: number;
  sinceMs: number;
}

export interface PairedFlyToState {
  active: boolean;
  untilMs: number;
  leftEnded: boolean;
  rightEnded: boolean;
}

export interface PaneState {
  provider: PaneProvider;
  mapState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}
