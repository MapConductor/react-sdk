import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { MarkerTilingOptions } from '@mapconductor/js-sdk-core';
import type { MapViewBaseProps } from '@mapconductor/js-sdk-react/native';
import type { MapViewStateInterface } from '@mapconductor/js-sdk-core';
import type { TomTomMapDesignType } from '@mapconductor/react-for-tomtom/state';

/**
 * アプリ向けの props。共通部分は {@link MapViewBaseProps} が持つので、
 * ドライバーが足すのは**その地図SDKにしかない prop だけ**。
 */
export interface TomTomMapViewProps
  extends MapViewBaseProps<MapViewStateInterface<TomTomMapDesignType>> {
  className?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
  markerTilingOptions?: MarkerTilingOptions;
}
