import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  type MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import { MapLibreDesign, MapLibreMapView2D, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapboxDesign, MapBoxMapView2D, useMapboxViewState } from '@mapconductor/react-for-mapbox';
import { LeafletDesign, LeafletMapView, useLeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { OpenLayersDesign, OpenLayersMapView, useOpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { ArcGISDesign, ArcGISMapView, ArcGISMapView2D, useArcGISViewState } from '@mapconductor/react-for-arcgis';
import { SingletonMapSlot, useSingletonMapState } from '../../../SingletonMaps';

export type PostOfficeMapState = MapViewStateInterface<MapDesignTypeInterface<unknown>>;

export interface PostOfficeMapContentProps {
  mapViewState: PostOfficeMapState;
  renderMapView(children: ReactNode, onMapClick: () => void): ReactNode;
}

interface PostOfficeMapProviderProps {
  cameraPosition: MapCameraPosition;
  markerTilingOptions?: MarkerTilingOptions;
  children(props: PostOfficeMapContentProps): ReactNode;
}

function GoogleProvider({ cameraPosition, children }: PostOfficeMapProviderProps) {
  const isGoogle3D = useLocation().pathname.startsWith('/google-maps-3d');
  const state = useSingletonMapState(isGoogle3D ? 'google-3d' : 'google-2d', cameraPosition);
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <SingletonMapSlot id="google-2d" onMapClick={onMapClick}>{content}</SingletonMapSlot>
    ),
  });
}

function MapLibreProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useMapLibreViewState({ mapDesignType: MapLibreDesign.OsmBrightJa, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <MapLibreMapView2D state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</MapLibreMapView2D>
    ),
  });
}

function MapboxProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useMapboxViewState({ accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '', mapDesignType: MapboxDesign.Streets, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <MapBoxMapView2D state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</MapBoxMapView2D>
    ),
  });
}

function LeafletProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useLeafletMapViewState({ mapDesignType: LeafletDesign.OpenStreetMap, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <LeafletMapView state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</LeafletMapView>
    ),
  });
}

function OpenLayersProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useOpenLayersMapViewState({ mapDesignType: OpenLayersDesign.OpenStreetMap, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <OpenLayersMapView state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</OpenLayersMapView>
    ),
  });
}

function ArcGISProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const isArcGIS3D = useLocation().pathname.startsWith('/arcgis-3d');
  const state = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition,
  });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      isArcGIS3D ? (
        <ArcGISMapView state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</ArcGISMapView>
      ) : (
        <ArcGISMapView2D state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</ArcGISMapView2D>
      )
    ),
  });
}

export function PostOfficeMapProvider(props: PostOfficeMapProviderProps) {
  const pathname = useLocation().pathname;
  if (pathname.startsWith('/google-maps')) return <GoogleProvider {...props} />;
  if (pathname.startsWith('/mapbox')) return <MapboxProvider {...props} />;
  if (pathname.startsWith('/leaflet')) return <LeafletProvider {...props} />;
  if (pathname.startsWith('/openlayers')) return <OpenLayersProvider {...props} />;
  if (pathname.startsWith('/arcgis')) return <ArcGISProvider {...props} />;
  return <MapLibreProvider {...props} />;
}
