import React, { useEffect } from 'react';
import { GoogleMapDesign, GoogleMapView, useGoogleMapViewState, type GoogleMapDesignType } from '@mapconductor/reactnative-for-googlemaps';
import type { ProviderViewProps } from './types';

interface GoogleMapsProviderViewProps extends ProviderViewProps {
  mapDesignType?: GoogleMapDesignType;
}

export function GoogleMapsProviderView({
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
}: GoogleMapsProviderViewProps) {
  const state = useGoogleMapViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? GoogleMapDesign.Normal,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <GoogleMapView
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
    </GoogleMapView>
  );
}
