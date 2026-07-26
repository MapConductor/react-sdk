import { useMemo, type ReactNode } from 'react';
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
import { AzureMapsDesign, AzureMapsMapView, useAzureMapsViewState } from '@mapconductor/react-for-azuremaps';
import '@mapconductor/react-for-azuremaps/style.css';
import { MapKitMapDesign, MapKitMapView, useMapKitViewState } from '@mapconductor/react-for-mapkit';
import { CesiumDesign, CesiumMapView, useCesiumMapViewState } from '@mapconductor/react-for-cesium';
import '@mapconductor/react-for-cesium/style.css';
import { HereMapDesign, HereMapView2D, useHereViewState } from '@mapconductor/react-for-here';
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

function AzureMapsProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useAzureMapsViewState({
    subscriptionKey: import.meta.env.VITE_AZURE_MAPS_SUBSCRIOTION_KEY ?? '',
    mapDesignType: AzureMapsDesign.Road,
    cameraPosition,
  });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <AzureMapsMapView state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</AzureMapsMapView>
    ),
  });
}

function MapKitProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useMapKitViewState({
    token: import.meta.env.VITE_MAPKIT_TOKEN ?? '',
    mapDesignType: MapKitMapDesign.Standard,
    cameraPosition,
  });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <MapKitMapView state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</MapKitMapView>
    ),
  });
}

function CesiumProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  const state = useCesiumMapViewState({ mapDesignType: CesiumDesign.Default, cameraPosition });
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <CesiumMapView state={state} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</CesiumMapView>
    ),
  });
}

function HereProvider({ cameraPosition, markerTilingOptions, children }: PostOfficeMapProviderProps) {
  // HERE Maps API for JavaScript is loaded from CDN (see index.html); the
  // platform is created with the host page's own credentials. Guard against the
  // CDN global not being present so a load failure shows a placeholder instead
  // of crashing the page.
  const platform = useMemo(() => {
    if (typeof H === 'undefined') return null;
    try {
      return new H.service.Platform({ apikey: import.meta.env.VITE_HERE_API_KEY });
    } catch {
      return null;
    }
  }, []);
  const state = useHereViewState({ mapDesignType: HereMapDesign.NormalDay, cameraPosition });
  if (!platform) {
    return (
      <div className="sample-map-placeholder" role="status">
        HERE Maps is unavailable. Ensure the HERE API script loaded and VITE_HERE_API_KEY is set.
      </div>
    );
  }
  return children({
    mapViewState: state,
    renderMapView: (content, onMapClick) => (
      <HereMapView2D state={state} platform={platform} markerTilingOptions={markerTilingOptions} onMapClick={onMapClick}>{content}</HereMapView2D>
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
  if (pathname.startsWith('/azuremaps')) return <AzureMapsProvider {...props} />;
  if (pathname.startsWith('/mapkit')) return <MapKitProvider {...props} />;
  if (pathname.startsWith('/cesium')) return <CesiumProvider {...props} />;
  if (pathname.startsWith('/here')) return <HereProvider {...props} />;
  return <MapLibreProvider {...props} />;
}
