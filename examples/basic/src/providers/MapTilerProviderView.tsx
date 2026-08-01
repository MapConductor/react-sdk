import { useEffect } from 'react';
import {
  MapTilerDesign,
  MapTilerMapView2D,
  useMapTilerViewState,
} from '@mapconductor/react-for-maptiler';
import '@mapconductor/react-for-maptiler/style.css';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function MapTilerProviderView({
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
  const state = useMapTilerViewState({
    apiKey: import.meta.env.VITE_MAPTILER ?? '',
    mapDesignType: MapTilerDesign.Streets,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPTILER to examples/basic/.env to load the MapTiler map.
      </div>
    );
  }

  return (
    <MapTilerMapView2D
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </MapTilerMapView2D>
  );
}
