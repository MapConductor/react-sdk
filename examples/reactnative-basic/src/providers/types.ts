import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  GeoPoint,
  MapCameraPosition,
  MapDesignTypeInterface,
  MapViewStateInterface,
  MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import type { MapLibreMapDesignType } from '@mapconductor/reactnative-for-maplibre';
import type { GoogleMapDesignType } from '@mapconductor/reactnative-for-googlemaps';
import type { HereMapDesignType } from '@mapconductor/reactnative-for-here';
import type { ArcGISDesignType } from '@mapconductor/reactnative-for-arcgis';

export type MapProvider = 'maplibre' | 'google-maps' | 'here' | 'arcgis';

export type CommonMapViewState = MapViewStateInterface<MapDesignTypeInterface<unknown>>;

export type ProviderDesignOverrides = {
  maplibre?: MapLibreMapDesignType;
  'google-maps'?: GoogleMapDesignType;
  here?: HereMapDesignType;
  arcgis?: ArcGISDesignType;
};

export interface ProviderViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  mapId?: string;
  cameraPosition: MapCameraPosition;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
  onMapLoaded?: () => void;
  markerTilingOptions?: MarkerTilingOptions;
  onStateReady?: (state: CommonMapViewState) => void;
}
