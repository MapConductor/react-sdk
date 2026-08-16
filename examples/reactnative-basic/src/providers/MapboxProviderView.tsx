import React, { useEffect } from 'react';
import {
  MapboxDesign,
  MapboxMapView,
  useMapboxViewState,
  type MapboxMapDesignType,
} from '@mapconductor/reactnative-for-mapbox';
import type { ProviderViewProps } from './types';

interface MapboxProviderViewProps extends ProviderViewProps {
  mapDesignType?: MapboxMapDesignType;
}

/**
 * Mapbox。android / iOS とも Mapbox の GL ネイティブ SDK で、
 * マーカーは GL のシンボルレイヤ。Compose / SwiftUI のオーバーレイは使わない。
 *
 * デザインは id でも `getValue()` でもなく**スタイル URI**（`styleJsonURL`）で
 * ネイティブへ渡す（`MapboxView.native.tsx` を参照）。
 *
 * アクセストークンは JS からは渡さない。android は `mapbox_access_token` リソース、
 * iOS は Info.plist の `MBXAccessToken` からネイティブが引く。
 */
export function MapboxProviderView({
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
}: MapboxProviderViewProps) {
  const state = useMapboxViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? MapboxDesign.Streets,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <MapboxMapView
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
    </MapboxMapView>
  );
}
