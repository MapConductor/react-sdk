import React, { useEffect } from 'react';
import {
  TemplateMapView,
  useTemplateViewState,
  type TemplateMapDesignType,
} from '@mapconductor/reactnative-for-template';
import type { ProviderViewProps } from './types';

interface TemplateProviderViewProps extends ProviderViewProps {
  mapDesignType?: TemplateMapDesignType;
}

/**
 * 雛形プロバイダ。実際の地図SDKではなく、ディスプレイリストを持つだけの代役を描く。
 * `reactnative-for-template` が実際にビルドでき、共通基底の配線が通っていることを
 * サンプルアプリ側からも確かめるために置いてある。
 */
export function TemplateProviderView({
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
}: TemplateProviderViewProps) {
  const state = useTemplateViewState({
    id: mapId,
    mapDesignType,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <TemplateMapView
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
    </TemplateMapView>
  );
}
