import React, { useEffect } from 'react';
import { HereMapDesign, HereMapView, useHereViewState, type HereMapDesignType } from '@mapconductor/reactnative-for-here';
import type { ProviderViewProps } from './types';

interface HereProviderViewProps extends ProviderViewProps {
  mapDesignType?: HereMapDesignType;
}

// Android reads HERE credentials from AndroidManifest.xml meta-data. iOS has no
// manifest equivalent, so it needs these supplied as props.
const HERE_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_HERE_ACCESS_KEY_ID;
const HERE_ACCESS_KEY_SECRET = process.env.EXPO_PUBLIC_HERE_ACCESS_KEY_SECRET;

export function HereProviderView({
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
}: HereProviderViewProps) {
  const state = useHereViewState({
    id: mapId,
    mapDesignType: mapDesignType ?? HereMapDesign.NormalDay,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <HereMapView
      state={state}
      style={style}
      accessKeyId={HERE_ACCESS_KEY_ID}
      accessKeySecret={HERE_ACCESS_KEY_SECRET}
      markerTilingOptions={markerTilingOptions}
      onMapLoaded={onMapLoaded}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </HereMapView>
  );
}
