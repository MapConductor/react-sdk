import { useEffect } from 'react';
import {
  MapboxDesign,
  MapBoxMapView2D,
  useMapboxViewState,
} from '@mapconductor/react-for-mapbox';
import '@mapconductor/react-for-mapbox/style.css';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function MapBoxProviderView({
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
  const state = useMapboxViewState({
    accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '',
    mapDesignType: MapboxDesign.Streets,
    cameraPosition,
  });
  const style = state.mapDesignType.getValue();

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  if (!state.accessToken && style.includes('mapbox://')) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPBOX_ACCESS_TOKEN to examples/basic/.env, or choose a non-Mapbox style.
      </div>
    );
  }

  return (
    <MapBoxMapView2D
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </MapBoxMapView2D>
  );
}
