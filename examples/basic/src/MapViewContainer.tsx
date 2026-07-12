import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapLibreDesign, MapLibreView, useMapLibreViewState, type MapLibreViewState } from '@mapconductor/react-for-maplibre';
import { GoogleMapDesign, GoogleMapView, GoogleMapView2D, useGoogleMapViewState, type GoogleMapViewState } from '@mapconductor/react-for-googlemaps';
import { createGeoPoint, createMapCameraPosition, MarkerTilingOptions, type GeoPoint, type MapCameraPosition, type MapViewStateInterface, type MapDesignTypeInterface } from '@mapconductor/js-sdk-core';
import '@mapconductor/react-for-maplibre/style.css';
import { type InitialCamera, DEFAULT_CAMERA } from './common';

export type { InitialCamera };
export { DEFAULT_CAMERA };

interface MapViewContainerProps {
  children?: React.ReactNode;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (cam: MapCameraPosition) => void;
  onCameraMove?: (cam: MapCameraPosition) => void;
  onCameraMoveEnd?: (cam: MapCameraPosition) => void;
  markerTilingOptions?: MarkerTilingOptions;
  state: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}

export function useSampleMapViewState(initialCamera: InitialCamera = DEFAULT_CAMERA) {

  const location = useLocation();
  const cameraPosition = createMapCameraPosition({
    position: createGeoPoint({ latitude: initialCamera.lat, longitude: initialCamera.lng }),
    zoom: initialCamera.zoom,
    bearing: initialCamera.bearing ?? 0,
    tilt: initialCamera.pitch ?? 0,
  });

  if (location.pathname.startsWith('/google-maps')) {
    const googleMapState = useGoogleMapViewState({
      mapDesignType: GoogleMapDesign.Normal,
      cameraPosition,
    });
    return googleMapState;
  }

  if (location.pathname.startsWith('/maplibre')) {
    const mapLibreState = useMapLibreViewState({
      mapDesignType: MapLibreDesign.OsmBrightJa,
      cameraPosition,
    });
    return mapLibreState;
  }

  throw `No mapViewState is available for : ${location.pathname}`;
}

function MapLibreContainer({ children, onMapClick, onCameraMoveStart, onCameraMove, onCameraMoveEnd, markerTilingOptions, state }: MapViewContainerProps) {
  const mapState = state as MapLibreViewState;

  const isActive = useRef(false);
  useEffect(() => () => { isActive.current = true; }, []);

  return (
    <MapLibreView
      state={mapState}
      projection="globe"
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveStart?.(newCam);
      }}
      onCameraMove={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMove?.(newCam);
      }}
      onCameraMoveEnd={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveEnd?.(newCam);
      }}
    >
      {children}
    </MapLibreView>
  );
}

function GoogleMapContainer2D({ children, onMapClick, onCameraMoveStart, onCameraMove, onCameraMoveEnd, markerTilingOptions, state }: MapViewContainerProps) {
  const mapState = state as GoogleMapViewState;

  const isActive = useRef(false);
  useEffect(() => () => { isActive.current = true; }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey || apiKey === 'your_api_key_here') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Google Maps API Key is Missing</h2>
        <p>To use the Google Maps provider, you need to provide an API key.</p>
        <p>1. Create a <code>.env</code> file in the <code>examples/basic</code> directory.</p>
        <p>2. Add your API key to the file:</p>
        <pre>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
      </div>
    );
  }

  return (
    <GoogleMapView2D
      state={mapState}
      apiKey={apiKey}
      mapId={'DEMO_MAP_ID'}
      version='alpha'
      libraries={'map3d'} // for demo
      markerTilingOptions={markerTilingOptions}
      onCameraMoveStart={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveStart?.(newCam);
      }}
      onCameraMove={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMove?.(newCam);
      }}
      onMapClick={onMapClick}
      onCameraMoveEnd={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveEnd?.(newCam);
      }}
    >
      {children}
    </GoogleMapView2D>
  );
}

function GoogleMapContainer3D({ children, onMapClick, onCameraMoveStart, onCameraMove, onCameraMoveEnd, state }: MapViewContainerProps) {
  const mapState = state as GoogleMapViewState;

  const isActive = useRef(false);
  useEffect(() => () => { isActive.current = true; }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey || apiKey === 'your_api_key_here') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Google Maps API Key is Missing</h2>
        <p>To use the Google Maps provider, you need to provide an API key.</p>
        <p>1. Create a <code>.env</code> file in the <code>examples/basic</code> directory.</p>
        <p>2. Add your API key to the file:</p>
        <pre>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
      </div>
    );
  }

  return (
    <GoogleMapView
      state={mapState}
      apiKey={apiKey}
      mapId={'DEMO_MAP_ID'}
      version='alpha'
      onMapClick={onMapClick}
      onCameraMoveStart={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveStart?.(newCam);
      }}
      onCameraMove={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMove?.(newCam);
      }}
      onCameraMoveEnd={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveEnd?.(newCam);
      }}
    >
      {children}
    </GoogleMapView>
  );
}

export function MapViewContainer({ children, onMapClick, onCameraMoveStart, onCameraMove, onCameraMoveEnd, markerTilingOptions, state }: MapViewContainerProps) {
  const location = useLocation();
  const isGoogle3D = location.pathname.startsWith('/google-maps-3d');
  const isGoogle2D = !isGoogle3D && location.pathname.startsWith('/google-maps');

  if (isGoogle3D) {
    return <GoogleMapContainer3D 
            onMapClick={onMapClick}
            onCameraMoveStart={onCameraMoveStart}
            onCameraMove={onCameraMove}
            onCameraMoveEnd={onCameraMoveEnd}
            state={state}>
              {children}
            </GoogleMapContainer3D>;
  }
  if (isGoogle2D) {
    return <GoogleMapContainer2D 
            onMapClick={onMapClick}
            onCameraMoveStart={onCameraMoveStart}
            onCameraMove={onCameraMove}
            onCameraMoveEnd={onCameraMoveEnd}
            markerTilingOptions={markerTilingOptions}
            state={state}>
              {children}
            </GoogleMapContainer2D>;
  }
  return <MapLibreContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          state={state}>
            {children}
          </MapLibreContainer>;
}
