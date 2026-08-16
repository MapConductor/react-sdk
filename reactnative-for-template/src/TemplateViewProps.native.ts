import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { MarkerTilingOptions } from '@mapconductor/js-sdk-core';
import type { MapViewBaseProps } from '@mapconductor/js-sdk-react/native';
import type { MapViewStateInterface } from '@mapconductor/js-sdk-core';
import type { TemplateMapDesignType } from '@mapconductor/react-for-template';

/**
 * アプリ向けの props。共通部分は {@link MapViewBaseProps} が持つので、
 * ドライバーが足すのは**その地図SDKにしかない prop だけ**。
 */
export interface TemplateMapViewProps
  extends MapViewBaseProps<MapViewStateInterface<TemplateMapDesignType>> {
  className?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
  markerTilingOptions?: MarkerTilingOptions;
}
