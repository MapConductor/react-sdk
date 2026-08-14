import { NativeMapViewHost } from '@mapconductor/js-sdk-react/internal';
import type { LongdoViewStateInterface } from '@mapconductor/react-for-longdo/state';
import { LongdoViewController } from './LongdoViewController.native';
import type { LongdoMapViewProps } from './LongdoViewProps.native';
import type { LongdoMapViewRef } from './LongdoTypeAlias.native';
import NativeLongdoMapView from './LongdoViewNativeComponent';

/**
 * ネイティブイベントの配線・オーバーレイ収集・InfoBubble レイヤは全 RN プロバイダで
 * 同一なので {@link NativeMapViewHost} に集約してある。ここで渡すのは
 * 「どのネイティブビューか」「デザインをどう文字列化するか」だけ。
 */
export function LongdoMapView(props: LongdoMapViewProps) {
  return (
    <NativeMapViewHost<LongdoMapViewRef, LongdoViewStateInterface>
      {...props}
      nativeComponent={NativeLongdoMapView}
      mapDesignValue={props.state.mapDesignType.id}
      // Longdo は WebView（Longdo Map API3）ベースで、ネイティブのホルダーは
      // 同期投影を持たない（toScreenOffset が null）。地図は Web Mercator なので
      // 画面座標は JS 側で計算する。これを指定しないと InfoBubble が出ない。
      screenProjection="webMercator"
      createController={(ref, camera) => new LongdoViewController(ref, camera)}
    />
  );
}
