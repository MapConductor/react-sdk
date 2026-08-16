import { NativeMapViewHost } from '@mapconductor/js-sdk-react/internal';
import type { MapViewStateInterface } from '@mapconductor/js-sdk-core';
import type { TemplateMapDesignType } from '@mapconductor/react-for-template';
import { TemplateViewController } from './TemplateViewController.native';
import type { TemplateMapViewProps } from './TemplateViewProps.native';
import type { TemplateMapViewRef } from './TemplateTypeAlias.native';
import NativeTemplateMapView from './TemplateViewNativeComponent';

/**
 * ネイティブイベントの配線・オーバーレイ収集・InfoBubble レイヤは全 RN プロバイダで
 * 同一なので {@link NativeMapViewHost} に集約してある。ここで渡すのは
 * 「どのネイティブビューか」「デザインをどう文字列化するか」だけ。
 */
export function TemplateMapView(props: TemplateMapViewProps) {
  return (
    <NativeMapViewHost<TemplateMapViewRef, MapViewStateInterface<TemplateMapDesignType>>
      {...props}
      nativeComponent={NativeTemplateMapView}
      // ネイティブへはデザインを 1 本の文字列で渡す。分解はネイティブ側の責任。
      mapDesignValue={props.state.mapDesignType.id}
      createController={(ref, camera) => new TemplateViewController(ref, camera)}
    />
  );
}
