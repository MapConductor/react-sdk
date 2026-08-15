import { NativeMapViewHost } from '@mapconductor/js-sdk-react/internal';
import type { MapViewStateInterface } from '@mapconductor/js-sdk-core';
import type { TomTomMapDesignType } from '@mapconductor/react-for-tomtom/state';
import { TomTomViewController } from './TomTomViewController.native';
import type { TomTomMapViewProps } from './TomTomViewProps.native';
import type { TomTomMapViewRef } from './TomTomTypeAlias.native';
import NativeTomTomMapView from './TomTomViewNativeComponent';

/**
 * ネイティブイベントの配線・オーバーレイ収集・InfoBubble レイヤは全 RN プロバイダで
 * 同一なので {@link NativeMapViewHost} に集約してある。ここで渡すのは
 * 「どのネイティブビューか」「デザインをどう文字列化するか」だけ。
 */
export function TomTomMapView(props: TomTomMapViewProps) {
  return (
    <NativeMapViewHost<TomTomMapViewRef, MapViewStateInterface<TomTomMapDesignType>>
      {...props}
      nativeComponent={NativeTomTomMapView}
      // ネイティブへはデザインを 1 本の文字列で渡す。分解はネイティブ側の責任。
      mapDesignValue={props.state.mapDesignType.id}
      createController={(ref, camera) => new TomTomViewController(ref, camera)}
    />
  );
}
