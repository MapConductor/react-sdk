import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  type MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerTilingOptions,
} from '@mapconductor/js-sdk-core';
import { MapLibreDesign, MapLibreView, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapboxDesign, MapboxView, useMapboxViewState } from '@mapconductor/react-for-mapbox';
import { LeafletDesign, LeafletMapView, useLeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { OpenLayersDesign, OpenLayersMapView, useOpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { ArcGISDesign, ArcGISMapView2D, useArcGISViewState } from '@mapconductor/react-for-arcgis';
import { SingletonGoogleMapSlot, useSingletonGoogleMapViewState } from '../../../SingletonGoogleMaps';

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
  const state = useSingletonGoogleMapViewState(cameraPosition);
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <SingletonGoogleMapSlot mode="2d" onMapClick={onMapClick}>{content}</SingletonGoogleMapSlot>
    ),
  });
}

function MapLibreProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useMapLibreViewState({ mapDesignType: MapLibreDesign.OsmBrightJa, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <MapLibreView state={state} projection="mercator" markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</MapLibreView>
    ),
  });
}

function MapboxProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useMapboxViewState({ mapDesignType: MapboxDesign.Streets, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <MapboxView state={state} accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? ''} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</MapboxView>
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
  const state = useArcGISViewState({
    apiKey: import.meta.env.VITE_ARCGIS_API_KEY ?? '',
    mapDesignType: ArcGISDesign.Streets,
    cameraPosition,
  });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <ArcGISMapView2D state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</ArcGISMapView2D>
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
