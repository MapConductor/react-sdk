import type React from 'react';
import type { HostComponent, NativeMethods } from 'react-native';
import type { NativeTomTomViewProps } from './TomTomViewNativeComponent';

export type TomTomMapViewRef =
  React.ComponentRef<HostComponent<NativeTomTomViewProps>> & NativeMethods;

/** RN では地図の実体はネイティブ側にあるので、JS からは触らせない。 */
export type TomTomMap = null;
