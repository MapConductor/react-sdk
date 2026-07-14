import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
  type MapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import {
  createGeoPoint,
  createMapCameraPosition,
  MarkerTilingOptions,
  type GeoPoint,
  type MapCameraPosition,
  type MapViewStateInterface,
  type MapDesignTypeInterface,
} from '@mapconductor/js-sdk-core';
import '@mapconductor/react-for-maplibre/style.css';
import { type InitialCamera, DEFAULT_CAMERA } from './common';
import {
  SingletonGoogleMapSlot,
  useSingletonGoogleMapViewState,
} from './SingletonGoogleMaps';

export type { InitialCamera };
export { DEFAULT_CAMERA };

interface MapViewContainerProps {
  children?: React.ReactNode;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
  markerTilingOptions?: MarkerTilingOptions;
  state: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}

export function useSampleMapViewState(initialCamera: InitialCamera = DEFAULT_CAMERA) {
  const location = useLocation();
  const cameraPosition = useMemo(() => createMapCameraPosition({
    position: createGeoPoint({ latitude: initialCamera.lat, longitude: initialCamera.lng }),
    zoom: initialCamera.zoom,
    bearing: initialCamera.bearing ?? 0,
    tilt: initialCamera.pitch ?? 0,
  }), [
    initialCamera.lat,
    initialCamera.lng,
    initialCamera.zoom,
    initialCamera.bearing,
    initialCamera.pitch,
  ]);
  const googleMapState = useSingletonGoogleMapViewState(cameraPosition);
  const mapLibreState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition,
  });

  if (location.pathname.startsWith('/google-maps')) return googleMapState;
  if (location.pathname.startsWith('/maplibre')) return mapLibreState;
  throw new Error(`No mapViewState is available for: ${location.pathname}`);
}

function MapLibreContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
}: MapViewContainerProps) {
  const mapState = state as MapLibreViewState;
  const isActive = useRef(false);

  useEffect(() => {
    isActive.current = true;
    return () => {
      isActive.current = false;
    };
  }, []);

  return (
    <MapLibreView
      state={mapState}
      projection="globe"
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
    >
      {children}
    </MapLibreView>
  );
}

export function MapViewContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
}: MapViewContainerProps) {
  const location = useLocation();
  const isGoogle3D = location.pathname.startsWith('/google-maps-3d');
  const isGoogle2D = !isGoogle3D && location.pathname.startsWith('/google-maps');

  if (isGoogle3D || isGoogle2D) {
    // Google Maps marker tiling is fixed at the singleton-host level because
    // it is constructor configuration. MapLibre can still configure it per page.
    void markerTilingOptions;
    void state;
    return (
      <SingletonGoogleMapSlot
        mode={isGoogle3D ? '3d' : '2d'}
        onMapClick={onMapClick}
        onCameraMoveStart={onCameraMoveStart}
        onCameraMove={onCameraMove}
        onCameraMoveEnd={onCameraMoveEnd}
      >
        {children}
      </SingletonGoogleMapSlot>
    );
  }

  return (
    <MapLibreContainer
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
      markerTilingOptions={markerTilingOptions}
      state={state}
    >
      {children}
    </MapLibreContainer>
  );
}
