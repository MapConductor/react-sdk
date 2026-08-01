import { useEffect } from 'react';
import {
  LongdoDesign,
  LongdoMapView2D,
  useLongdoViewState,
} from '@mapconductor/react-for-longdo';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function LongdoProviderView({
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
  const state = useLongdoViewState({
    apiKey: import.meta.env.VITE_LONGDO ?? '',
    mapDesignType: LongdoDesign.Normal,
    cameraPosition,
  });

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  if (!state.apiKey) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_LONGDO to examples/basic/.env to load the Longdo map.
      </div>
    );
  }

  return (
    <LongdoMapView2D
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </LongdoMapView2D>
  );
}
