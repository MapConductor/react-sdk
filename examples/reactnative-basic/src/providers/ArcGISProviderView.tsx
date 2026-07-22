import React, { useEffect } from 'react';
import { ArcGISDesign, ArcGISMapView, useArcGISViewState, type ArcGISDesignType } from '@mapconductor/reactnative-for-arcgis';
import type { ProviderViewProps } from './types';

interface ArcGISProviderViewProps extends ProviderViewProps {
  mapDesignType?: ArcGISDesignType;
}

const ARCGIS_API_KEY = process.env.EXPO_PUBLIC_ARCGIS_API_KEY;

export function ArcGISProviderView({
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
  onStateReady,
}: ArcGISProviderViewProps) {
  const state = useArcGISViewState({
    id: mapId,
    apiKey: ARCGIS_API_KEY,
    mapDesignType: mapDesignType ?? ArcGISDesign.Streets,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <ArcGISMapView
      state={state}
      style={style}
      markerTilingOptions={markerTilingOptions}
      onMapLoaded={onMapLoaded}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </ArcGISMapView>
  );
}
