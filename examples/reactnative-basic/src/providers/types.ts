import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  CameraRestriction,
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
import type { LongdoMapDesignType } from '@mapconductor/reactnative-for-longdo';
import type { MapTilerMapDesignType } from '@mapconductor/reactnative-for-maptiler';
import type { MapboxMapDesignType } from '@mapconductor/reactnative-for-mapbox';

/**
 * サンプルに載せるプロバイダ。**`reactnative-for-template` は載せない。**
 * 雛形は「実在の地図SDKではなく、ディスプレイリストを描くだけの代役」なので、
 * アプリ開発者に見せる選択肢としては意味がない（web の `examples/basic` も
 * `react-for-template` を登録していない）。
 * ただし依存自体は package.json に残してある。RN の autolinking が雛形の
 * ネイティブ側（Swift / Kotlin）を**コンパイルし続ける**ための唯一の仕組みで、
 * これを外すと雛形が壊れても誰も気づかなくなる。
 */
export type MapProvider = 'maplibre' | 'google-maps' | 'here' | 'arcgis' | 'longdo' | 'maptiler' | 'mapbox';

export type CommonMapViewState = MapViewStateInterface<MapDesignTypeInterface<unknown>>;

export type ProviderDesignOverrides = {
  maplibre?: MapLibreMapDesignType;
  'google-maps'?: GoogleMapDesignType;
  here?: HereMapDesignType;
  arcgis?: ArcGISDesignType;
  longdo?: LongdoMapDesignType;
  maptiler?: MapTilerMapDesignType;
  mapbox?: MapboxMapDesignType;
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
  /** カメラの可動範囲。SDK 側で実行時に適用される（web の restrictBounds と同じ役割）。 */
  cameraRestriction?: CameraRestriction | null;
  onStateReady?: (state: CommonMapViewState) => void;
}
