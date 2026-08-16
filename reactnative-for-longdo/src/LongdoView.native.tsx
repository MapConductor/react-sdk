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
      // 投影は JS ではなくネイティブ側（LongdoMapHost）が持つ。ホルダーの
      // toScreenOffset は null を返すが、ホストは自前のカメラ計算で投影できていて、
      // SwiftUI / Compose 版の InfoBubble もその経路で動いている。
      // ここで JS の投影に切り替えると、同じ計算が 2 か所に増えるうえ、
      // タップの当たり判定（ネイティブ側にしかない）と食い違う。
      createController={(ref, camera) => new LongdoViewController(ref, camera)}
    />
  );
}
