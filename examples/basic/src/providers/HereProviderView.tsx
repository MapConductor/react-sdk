import { useEffect, useMemo } from 'react';
import {
  HereMapDesign,
  HereMapView2D,
  useHereViewState,
} from '@mapconductor/react-for-here';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

export default function HereProviderView({
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  onStateReady,
  restrictBounds,
}: ProviderViewProps) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useHereViewState({
    mapDesignType: HereMapDesign.NormalDay,
    cameraPosition,
  });
  // HERE Maps API for JavaScript is loaded from CDN (see index.html); the
  // platform must be created with the host page's own credentials.
  const platform = useMemo(
    () => new H.service.Platform({ apikey: import.meta.env.VITE_HERE_API_KEY }),
    [],
  );

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  return (
    <HereMapView2D
      state={state}
      platform={platform}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      restrictBounds={restrictBounds}
    >
      {children}
    </HereMapView2D>
  );
}
