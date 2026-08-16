import type React from 'react';
import type { HostComponent, NativeMethods } from 'react-native';
import type { NativeTemplateViewProps } from './TemplateViewNativeComponent';

export type TemplateMapViewRef =
  React.ComponentRef<HostComponent<NativeTemplateViewProps>> & NativeMethods;

/** RN では地図の実体はネイティブ側にあるので、JS からは触らせない。 */
export type TemplateMap = null;
