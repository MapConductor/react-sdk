import React, { useEffect } from 'react';
import {
  MapTilerDesign,
  MapTilerMapView,
  useMapTilerViewState,
  type MapTilerMapDesignType,
} from '@mapconductor/reactnative-for-maptiler';
import type { ProviderViewProps } from './types';

interface MapTilerProviderViewProps extends ProviderViewProps {
  mapDesignType?: MapTilerMapDesignType;
}

/**
 * MapTiler。**android と iOS で中身が違う**数少ないプロバイダ。
 * android は MapTiler 独自の WebView SDK（`com.maptiler.maptilersdk`）を Compose で載せ、
 * マーカーと InfoBubble は Compose のオーバーレイが描く。iOS は MapLibre ネイティブに
 * MapTiler のスタイル URL を差す。prop と振る舞いは揃えてあるが、
 * 片方の挙動から他方を推測しないこと。
 *
 * API キーは JS からは渡さない。android は AndroidManifest の `MAPTILER_API_KEY`、
 * iOS は Info.plist の `MapTilerAPIKey` からネイティブが引く。
 */
export function MapTilerProviderView({
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
}: MapTilerProviderViewProps) {
  const state = useMapTilerViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? MapTilerDesign.Streets,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <MapTilerMapView
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
    </MapTilerMapView>
  );
}
