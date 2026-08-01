import { useEffect } from 'react';
import {
  TomTomDesign,
  TomTomMapView2D,
  useTomTomViewState,
} from '@mapconductor/react-for-tomtom';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function TomTomProviderView({
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
  const state = useTomTomViewState({
    apiKey: import.meta.env.VITE_TOMTOM_API_KEY ?? '',
    mapDesignType: TomTomDesign.Standard,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_TOMTOM_API_KEY to examples/basic/.env to load the TomTom map.
      </div>
    );
  }

  return (
    <TomTomMapView2D
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </TomTomMapView2D>
  );
}
