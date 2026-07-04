import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapLibreDesign, MapLibreView, useMapLibreViewState, type MapLibreViewState } from '@mapconductor/js-sdk-react-for-maplibre';
import { GoogleMapDesign, GoogleMapsView, GoogleMapsView2D, useGoogleMapViewState, type GoogleMapViewState } from '@mapconductor/js-sdk-react-for-googlemaps';
import { createGeoPoint, createMapCameraPosition, MarkerTilingOptions, type GeoPoint, type MapCameraPosition, type MapViewStateInterface, type MapDesignTypeInterface } from '@mapconductor/js-sdk-core';
import '@mapconductor/js-sdk-react-for-maplibre/style.css';
import { type InitialCamera, DEFAULT_CAMERA, updateCameraInURL } from './common';

export type { InitialCamera };
export { DEFAULT_CAMERA };

interface MapViewContainerProps {
  children?: React.ReactNode;
  onMapClick?: (point: GeoPoint) => void;
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
  const mapLibreState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition,
  });
  const googleMapState = useGoogleMapViewState({
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition,
  });

  if (location.pathname.startsWith('/google-maps')) return googleMapState;
  return mapLibreState;
}

function MapLibreContainer({ children, onMapClick, onCameraMoveEnd, markerTilingOptions, state }: MapViewContainerProps) {
  const navigate = useNavigate();
  const mapState = state as MapLibreViewState;

  const isActive = useRef(true);
  useEffect(() => () => { isActive.current = false; }, []);

  return (
    <MapLibreView
      state={mapState}
      projection="globe"
      onMapClick={onMapClick}
      markerTilingOptions={markerTilingOptions}
      onCameraMoveEnd={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveEnd?.(newCam);
        updateCameraInURL(
          { lat: newCam.center.latitude, lng: newCam.center.longitude, zoom: newCam.zoom, bearing: newCam.bearing, pitch: newCam.pitch },
          navigate,
        );
      }}
    >
      {children}
    </MapLibreView>
  );
}

function GoogleMapsContainer2D({ children, onMapClick, onCameraMoveEnd, markerTilingOptions, state }: MapViewContainerProps) {
  const navigate = useNavigate();
  const mapState = state as GoogleMapViewState;

  const isActive = useRef(true);
  useEffect(() => () => { isActive.current = false; }, []);

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
    <GoogleMapsView2D
      state={mapState}
      apiKey={apiKey}
      mapId={'DEMO_MAP_ID'}
      onMapClick={onMapClick}
      markerTilingOptions={markerTilingOptions}
      onCameraMoveEnd={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveEnd?.(newCam);
        updateCameraInURL(
          { lat: newCam.center.latitude, lng: newCam.center.longitude, zoom: newCam.zoom, bearing: newCam.bearing, pitch: newCam.pitch },
          navigate,
        );
      }}
    >
      {children}
    </GoogleMapsView2D>
  );
}

function GoogleMapsContainer3D({ children, onMapClick, onCameraMoveEnd, state }: MapViewContainerProps) {
  const navigate = useNavigate();
  const mapState = state as GoogleMapViewState;

  const isActive = useRef(true);
  useEffect(() => () => { isActive.current = false; }, []);

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
    <GoogleMapsView
      state={mapState}
      apiKey={apiKey}
      mapId={'DEMO_MAP_ID'}
      onMapClick={onMapClick}
      onCameraMoveEnd={(newCam: any) => {
        if (!isActive.current) return;
        onCameraMoveEnd?.(newCam);
        updateCameraInURL(
          { lat: newCam.center.latitude, lng: newCam.center.longitude, zoom: newCam.zoom, bearing: newCam.bearing, pitch: newCam.pitch },
          navigate,
        );
      }}
    >
      {children}
    </GoogleMapsView>
  );
}

export function MapViewContainer({ children, onMapClick, onCameraMoveEnd, markerTilingOptions, state }: MapViewContainerProps) {
  const location = useLocation();
  const isGoogle3D = location.pathname.startsWith('/google-maps-3d');
  const isGoogle2D = !isGoogle3D && location.pathname.startsWith('/google-maps');

  if (isGoogle3D) {
    return <GoogleMapsContainer3D 
    
    onMapClick={onMapClick} onCameraMoveEnd={onCameraMoveEnd} state={state}>{children}</GoogleMapsContainer3D>;
  }
  if (isGoogle2D) {
    return <GoogleMapsContainer2D 
      onMapClick={onMapClick} onCameraMoveEnd={onCameraMoveEnd} markerTilingOptions={markerTilingOptions} state={state}>{children}</GoogleMapsContainer2D>;
  }
  return <MapLibreContainer onMapClick={onMapClick} onCameraMoveEnd={onCameraMoveEnd} markerTilingOptions={markerTilingOptions} state={state}>{children}</MapLibreContainer>;
}
