import { requireNativeComponent } from 'react-native';
import type {
  NativeMapViewEvent,
  NativeMapViewProps,
} from '@mapconductor/js-sdk-react/internal';

// 共通のブリッジ props / イベント型は js-sdk-react に集約してある。
export type NativeTomTomViewEvent<T> = NativeMapViewEvent<T>;

/** その地図SDKにしかない prop（API キー等）はここに足す。 */
export interface NativeTomTomViewProps extends NativeMapViewProps {}

export {
  toNativeCameraPosition,
  toNativeMarkerTilingOptions,
  type NativeMarkerTilingOptions,
} from '@mapconductor/js-sdk-react/internal';

export default requireNativeComponent<NativeTomTomViewProps>(
  // android の MapConductorTomTomViewManager (REACT_CLASS) と
  // ios の RCT_EXPORT_MODULE(...) に合わせること。3 か所がずれると
  // 「View config not found」で落ちる。
  'TomTomMapView'
);
