import React, { useEffect } from 'react';
import { MapLibreDesign, MapLibreMapView, useMapLibreViewState, type MapLibreMapDesignType } from '@mapconductor/reactnative-for-maplibre';
import type { ProviderViewProps } from './types';

interface MapLibreProviderViewProps extends ProviderViewProps {
  mapDesignType?: MapLibreMapDesignType;
}

export function MapLibreProviderView({
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
}: MapLibreProviderViewProps) {
  const state = useMapLibreViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? MapLibreDesign.DemoTiles,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <MapLibreMapView
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
    </MapLibreMapView>
  );
}
