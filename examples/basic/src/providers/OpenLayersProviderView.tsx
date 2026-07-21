import { useEffect } from 'react';
import {
  OpenLayersDesign,
  OpenLayersMapView,
  useOpenLayersMapViewState,
} from '@mapconductor/react-for-openlayers';
import '@mapconductor/react-for-openlayers/style.css';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function OpenLayersProviderView({
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
  const state = useOpenLayersMapViewState({
    mapDesignType: OpenLayersDesign.OpenStreetMap,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <OpenLayersMapView
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </OpenLayersMapView>
  );
}
