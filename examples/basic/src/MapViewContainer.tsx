import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
  type MapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import {
  MapboxDesign,
  MapboxView,
  useMapboxViewState,
  type MapboxViewState,
} from '@mapconductor/react-for-mapbox';
import {
  LeafletDesign,
  LeafletMapView,
  useLeafletMapViewState,
  type LeafletViewState,
} from '@mapconductor/react-for-leaflet';
import {
  OpenLayersDesign,
  OpenLayersMapView,
  useOpenLayersMapViewState,
  type OpenLayersMapViewState,
} from '@mapconductor/react-for-openlayers';
import {
  ArcGISDesign,
  ArcGISMapView,
  ArcGISMapView2D,
  useArcGISViewState,
  type ArcGISViewState,
} from '@mapconductor/react-for-arcgis';
import {
  CesiumDesign,
  CesiumMapView,
  useCesiumMapViewState,
  type CesiumMapViewState,
} from '@mapconductor/react-for-cesium';
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
import '@mapconductor/react-for-mapbox/style.css';
import '@mapconductor/react-for-leaflet/style.css';
import '@mapconductor/react-for-openlayers/style.css';
import '@mapconductor/react-for-cesium/style.css';
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
    tilt: initialCamera.tilt ?? 0,
  }), [
    initialCamera.lat,
    initialCamera.lng,
    initialCamera.zoom,
    initialCamera.bearing,
    initialCamera.tilt,
  ]);
  const googleMapState = useSingletonGoogleMapViewState(cameraPosition);
  const mapLibreState = useMapLibreViewState({
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition,
  });
  const mapboxState = useMapboxViewState({
    mapDesignType: MapboxDesign.Streets,
    cameraPosition,
  });
  const leafletState = useLeafletMapViewState({
    mapDesignType: LeafletDesign.OpenStreetMap,
    cameraPosition,
  });
  const openLayersState = useOpenLayersMapViewState({
    mapDesignType: OpenLayersDesign.OpenStreetMap,
    cameraPosition,
  });
  const arcGisState = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition,
  });
  const cesiumState = useCesiumMapViewState({
    mapDesignType: CesiumDesign.Default,
    cameraPosition,
  });

  if (location.pathname.startsWith('/google-maps')) return googleMapState;
  if (location.pathname.startsWith('/mapbox')) return mapboxState;
  if (location.pathname.startsWith('/maplibre')) return mapLibreState;
  if (location.pathname.startsWith('/leaflet')) return leafletState;
  if (location.pathname.startsWith('/openlayers')) return openLayersState;
  if (location.pathname.startsWith('/arcgis')) return arcGisState;
  if (location.pathname.startsWith('/cesium')) return cesiumState;
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
      state={state as LeafletViewState}
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

function OpenLayersContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
}: MapViewContainerProps) {
  return (
    <OpenLayersMapView
      state={state as OpenLayersMapViewState}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </OpenLayersMapView>
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

function MapboxContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
}: MapViewContainerProps) {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';
  const style = state.mapDesignType.getValue();
  if (!accessToken && style.includes('mapbox://')) {
    return (
      <div className="sample-map-placeholder" role="status">
        Add VITE_MAPBOX_ACCESS_TOKEN to examples/basic/.env, or choose a non-Mapbox style.
      </div>
    );
  }

  return (
    <MapboxView
      state={state as MapboxViewState}
      accessToken={accessToken}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </MapboxView>
  );
}

function ArcGISContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
  useSceneView,
}: MapViewContainerProps & { useSceneView: boolean }) {
  const View = useSceneView ? ArcGISMapView : ArcGISMapView2D;
  return (
    <View
      state={state as ArcGISViewState}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </View>
  );
}

function CesiumContainer({
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
  markerTilingOptions,
  state,
}: MapViewContainerProps) {
  return (
    <CesiumMapView
      state={state as CesiumMapViewState}
      markerTilingOptions={markerTilingOptions}
      onMapClick={onMapClick}
      onCameraMoveStart={onCameraMoveStart}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </CesiumMapView>
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
  const isOpenLayers = location.pathname.startsWith('/openlayers');
  const isMapbox = location.pathname.startsWith('/mapbox');
  const isMapLibre3D = location.pathname.startsWith('/maplibre-3d');
  const isMapLibre2D = !isMapLibre3D && location.pathname.startsWith('/maplibre');
  const isArcGIS3D = location.pathname.startsWith('/arcgis-3d');
  const isArcGIS2D = !isArcGIS3D && location.pathname.startsWith('/arcgis');
  const isCesium = location.pathname.startsWith('/cesium');

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

    case isOpenLayers: {
      return (
        <OpenLayersContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          state={state}
        >
          {children}
        </OpenLayersContainer>
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

    case isMapbox: {
      return (
        <MapboxContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          state={state}
        >
          {children}
        </MapboxContainer>
      );
    }

    case isArcGIS3D || isArcGIS2D: {
      return (
        <ArcGISContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          state={state}
          useSceneView={isArcGIS3D}
        >
          {children}
        </ArcGISContainer>
      );
    }

    case isCesium: {
      return (
        <CesiumContainer
          onMapClick={onMapClick}
          onCameraMoveStart={onCameraMoveStart}
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
          markerTilingOptions={markerTilingOptions}
          state={state}
        >
          {children}
        </CesiumContainer>
      );
    }

    default: {
      return (
        <div>No provider can be detected</div>
      );
    }
  }

}
