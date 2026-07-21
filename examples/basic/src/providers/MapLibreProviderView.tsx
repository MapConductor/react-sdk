import { useEffect, useRef } from 'react';
import {
  MapLibreDesign,
  MapLibreMapView,
  MapLibreMapView2D,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import '@mapconductor/react-for-maplibre/style.css';
import type { MapCameraPosition } from '@mapconductor/js-sdk-core';
import { useInitialCameraPosition } from './useInitialCameraPosition';
import type { ProviderViewProps } from './types';

interface MapLibreProviderViewProps extends ProviderViewProps {
  useGlobe: boolean;
}

export default function MapLibreProviderView({
  children,
  initialCamera,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  useGlobe,
  onStateReady,
  restrictBounds,
}: MapLibreProviderViewProps) {
  const cameraPosition = useInitialCameraPosition(initialCamera);
  const state = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition,
  });
  const isActive = useRef(false);

  useEffect(() => {
    isActive.current = true;
    return () => {
      isActive.current = false;
    };
  }, []);

  useEffect(() => {
    onStateReady?.(state);
  }, [state, onStateReady]);

  const MapView = useGlobe ? MapLibreMapView : MapLibreMapView2D;

  return (
    <MapView
      state={state}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={(camera: MapCameraPosition) => {
        if (isActive.current) onCameraMoveStart?.(camera);
      }}
      onCameraMove={(camera: MapCameraPosition) => {
        if (isActive.current) onCameraMove?.(camera);
      }}
      onCameraMoveEnd={(camera: MapCameraPosition) => {
        if (isActive.current) onCameraMoveEnd?.(camera);
      }}
      restrictBounds={restrictBounds}
    >
      {children}
    </MapView>
  );
}
