import { useEffect } from 'react';
import {
  LeafletDesign,
  LeafletMapView,
  useLeafletMapViewState,
} from '@mapconductor/react-for-leaflet';
import '@mapconductor/react-for-leaflet/style.css';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function LeafletProviderView({
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  onStateReady,
  restrictBounds,
}: ProviderViewProps) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <LeafletMapView
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </LeafletMapView>
  );
}
