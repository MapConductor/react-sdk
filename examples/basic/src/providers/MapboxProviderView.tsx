import { useEffect } from 'react';
import {
  MapboxDesign,
  MapboxView,
  useMapboxViewState,
} from '@mapconductor/react-for-mapbox';
import '@mapconductor/react-for-mapbox/style.css';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function MapboxProviderView({
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  onStateReady,
}: ProviderViewProps) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useMapboxViewState({
    mapDesignType: MapboxDesign.Streets,
    cameraPosition,
  });
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';
  const style = state.mapDesignType.getValue();

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  if (!accessToken && style.includes('mapbox://')) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPBOX_ACCESS_TOKEN to examples/basic/.env, or choose a non-Mapbox style.
      </div>
    );
  }

  return (
    <MapboxView
      state={state}
      accessToken={accessToken}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </MapboxView>
  );
}
