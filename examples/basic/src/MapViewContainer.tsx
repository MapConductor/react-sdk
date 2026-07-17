import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
  type MapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import {
  LeafletDesign,
  LeafletMapView,
  useLeafletMapViewState,
  type LeafletMapViewState,
} from '@mapconductor/react-for-leaflet';
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
import '@mapconductor/react-for-leaflet/style.css';
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

type MapLibreContainerProps = MapViewContainerProps & {
  projection: 'mercator' | 'globe';
};

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
  const leafletState = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition,
  });

  if (location.pathname.startsWith('/google-maps')) return googleMapState;
  if (location.pathname.startsWith('/maplibre')) return mapLibreState;
  if (location.pathname.startsWith('/leaflet')) return leafletState;
  throw new Error(`No mapViewState is available for: ${location.pathname}`);
}

function LeafletContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
}: MapViewContainerProps) {
  return (
    <LeafletMapView
      state={state as LeafletMapViewState}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </LeafletMapView>
  );
}

function MapLibreContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  projection,
  state,
}: MapLibreContainerProps) {
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
      projection={projection}
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
  const isLeaflet = location.pathname.startsWith('/leaflet');
  const isMapLibre3D = location.pathname.startsWith('/maplibre-3d');
  const isMapLibre2D = !isMapLibre3D && location.pathname.startsWith('/maplibre');

  switch(true) {
    case isGoogle3D || isGoogle2D: {
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

    case isLeaflet: {
      return (
        <LeafletContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          state={state}
        >
          {children}
        </LeafletContainer>
      );
    }

    case isMapLibre3D || isMapLibre2D: {

      return (
        <MapLibreContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          projection={isMapLibre3D ? 'globe' : 'mercator'}
          state={state}
        >
          {children}
        </MapLibreContainer>
      );
    }

    default: {
      return (
        <div>No provider can be detected</div>
      );
    }
  }

}
