import React, { useEffect } from 'react';
import {
  TomTomDesign,
  TomTomMapView,
  useTomTomViewState,
  type TomTomMapDesignType,
} from '@mapconductor/reactnative-for-tomtom';
import type { ProviderViewProps } from './types';

interface TomTomProviderViewProps extends ProviderViewProps {
  mapDesignType?: TomTomMapDesignType;
}

/**
 * TomTom Orbis。android / iOS ともネイティブ SDK（TomTom Orbis Maps Display SDK）で、
 * マーカーは SDK のアノテーションが描く（Longdo / MapTiler のような Compose
 * オーバーレイは経由しない）。
 *
 * **デザインのカタログはネイティブのほうが狭い。** web は `standard-light` /
 * `mono-dark` 等の派生 id を持つが、android / iOS は standard / driving / satellite の
 * 3 つで、それ以外の id は Standard に丸められる。
 *
 * API キーは JS からは渡さない。android は AndroidManifest の `TOMTOM_API_KEY`、
 * iOS は Info.plist の `TomTomAPIKey` からネイティブが引く。
 */
export function TomTomProviderView({
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
}: TomTomProviderViewProps) {
  const state = useTomTomViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? TomTomDesign.Standard,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <TomTomMapView
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
    </TomTomMapView>
  );
}
