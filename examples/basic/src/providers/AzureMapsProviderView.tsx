import { useEffect } from 'react';
import {
  AzureMapsDesign,
  AzureMapsMapView,
  useAzureMapsViewState,
} from '@mapconductor/react-for-azuremaps';
import '@mapconductor/react-for-azuremaps/style.css';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function AzureMapsProviderView({
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
  const state = useAzureMapsViewState({
    // Note: the env var name carries the spelling used in examples/basic/.env.
    subscriptionKey: import.meta.env.VITE_AZURE_MAPS_SUBSCRIOTION_KEY ?? '',
    mapDesignType: AzureMapsDesign.Road,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  if (!state.subscriptionKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_AZURE_MAPS_SUBSCRIOTION_KEY to examples/basic/.env to view the Azure Maps sample.
      </div>
    );
  }

  return (
    <AzureMapsMapView
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </AzureMapsMapView>
  );
}
