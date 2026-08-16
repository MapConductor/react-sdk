import { LongdoViewStateInterface } from '@mapconductor/react-for-longdo/state';
export { LongdoDesign, LongdoMapDesignType, LongdoViewState, LongdoViewStateInterface, useLongdoViewState } from '@mapconductor/react-for-longdo/state';
import * as React from 'react';
import React__default from 'react';
import { HostComponent, NativeMethods, StyleProp, ViewStyle } from 'react-native';
import { NativeMapViewProps, NativeMapViewEvent, ReactNativeBridgeMapViewController, ReactNativeMapViewHolder } from '@mapconductor/js-sdk-react/internal';
export { NativeMarkerStatePayload as NativeLongdoMarkerState, NativeMarkerTilingOptions, markerStateToNative, toNativeCameraPosition, toNativeMarkerTilingOptions } from '@mapconductor/js-sdk-react/internal';
import { MapViewControllerInterface, MarkerTilingOptions } from '@mapconductor/js-sdk-core';
import { MapViewBaseProps } from '@mapconductor/js-sdk-react/native';

type NativeLongdoViewEvent<T> = NativeMapViewEvent<T>;
/** その地図SDKにしかない prop（API キー等）はここに足す。 */
interface NativeLongdoViewProps extends NativeMapViewProps {
}

type LongdoMapViewRef = React__default.ComponentRef<HostComponent<NativeLongdoViewProps>> & NativeMethods;
/** RN では地図の実体はネイティブ側にあるので、JS からは触らせない。 */
type LongdoMap = null;

type LongdoViewControllerInterface = MapViewControllerInterface;

/**
 * ネイティブブリッジの実装は全 RN プロバイダで同一なので
 * {@link ReactNativeBridgeMapViewController} に集約してある。ここはネイティブビューの
 * ref 型を与えるだけ。プロバイダ固有の振る舞いが要るときだけメソッドを override する。
 */
declare class LongdoViewController extends ReactNativeBridgeMapViewController<LongdoMapViewRef> {
}

/**
 * RN のホルダーは全プロバイダで同一（投影はネイティブ側が行う）なので
 * {@link ReactNativeMapViewHolder} に集約してある。ここは ref 型を与えるだけ。
 */
declare class LongdoMapViewHolder extends ReactNativeMapViewHolder<LongdoMapViewRef> {
}

/**
 * アプリ向けの props。共通部分は {@link MapViewBaseProps} が持つので、
 * ドライバーが足すのは**その地図SDKにしかない prop だけ**。
 */
interface LongdoMapViewProps extends MapViewBaseProps<LongdoViewStateInterface> {
    className?: string;
    containerStyle?: StyleProp<ViewStyle>;
    onError?: (error: Error) => void;
    children?: React__default.ReactNode;
    markerTilingOptions?: MarkerTilingOptions;
}

/**
 * ネイティブイベントの配線・オーバーレイ収集・InfoBubble レイヤは全 RN プロバイダで
 * 同一なので {@link NativeMapViewHost} に集約してある。ここで渡すのは
 * 「どのネイティブビューか」「デザインをどう文字列化するか」だけ。
 */
declare function LongdoMapView(props: LongdoMapViewProps): React.JSX.Element;

export { type LongdoMap, LongdoMapView, LongdoMapViewHolder, type LongdoMapViewProps, type LongdoMapViewRef, LongdoViewController, type LongdoViewControllerInterface, type NativeLongdoViewEvent, type NativeLongdoViewProps };
