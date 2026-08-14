import type React from 'react';
import type { HostComponent, NativeMethods } from 'react-native';
import type { NativeLongdoViewProps } from './LongdoViewNativeComponent';

export type LongdoMapViewRef =
  React.ComponentRef<HostComponent<NativeLongdoViewProps>> & NativeMethods;

/** RN では地図の実体はネイティブ側にあるので、JS からは触らせない。 */
export type LongdoMap = null;
