import React, { useEffect } from 'react';
import {
  LongdoDesign,
  LongdoMapView,
  useLongdoViewState,
  type LongdoMapDesignType,
} from '@mapconductor/reactnative-for-longdo';
import type { ProviderViewProps } from './types';

interface LongdoProviderViewProps extends ProviderViewProps {
  mapDesignType?: LongdoMapDesignType;
}

/**
 * Longdo（タイ）。WebView（Longdo Map API3）ベースで、マーカーと InfoBubble は
 * ネイティブ側の Compose オーバーレイが描く。画面座標は JS 側で計算する
 * （ネイティブのホルダーが同期投影を持たないため）。
 */
export function LongdoProviderView({
  children,
  style,
  mapId,
  cameraPosition,
  mapDesignType,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  onMapLoaded,
  markerTilingOptions,
  cameraRestriction,
  onStateReady,
}: LongdoProviderViewProps) {
  const state = useLongdoViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? LongdoDesign.Normal,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <LongdoMapView
      state={state}
      style={style}
      markerTilingOptions={markerTilingOptions}
      cameraRestriction={cameraRestriction}
      onMapLoaded={onMapLoaded}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </LongdoMapView>
  );
}
