import type { ReactNode } from 'react';
import type { MapCameraPosition } from '@mapconductor/js-sdk-core';
import {
  GoogleMapView,
  GoogleMapView2D,
  ZoomAltitudeConverter as GoogleZoomAltitudeConverter,
  type GoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreMapView,
  type MapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import {
  MapBoxMapView,
  MapBoxMapView2D,
  ZoomAltitudeConverter as MapboxZoomAltitudeConverter,
  type MapboxViewState,
} from '@mapconductor/react-for-mapbox';
import {
  LeafletMapView,
  type LeafletMapViewState,
} from '@mapconductor/react-for-leaflet';
import {
  OpenLayersMapView,
  type OpenLayersMapViewState,
} from '@mapconductor/react-for-openlayers';
import {
  ArcGISMapView,
  ArcGISMapView2D,
  type ArcGISViewState,
} from '@mapconductor/react-for-arcgis';
import {
  CesiumMapView,
  ZoomAltitudeConverter as CesiumZoomAltitudeConverter,
  type CesiumMapViewState,
} from '@mapconductor/react-for-cesium';
import type { PaneProvider, PaneState } from './types';
import { HereMapView2D, HereViewState } from '@mapconductor/react-for-here';

interface MapViewRenderProps {
  paneState: PaneState;
  children: ReactNode;
  onCameraMove: (camera: MapCameraPosition) => void;
  onCameraMoveEnd: (camera: MapCameraPosition) => void;
}

export interface CameraSyncProviderAdapter {
  id: PaneProvider;
  label: string;
  render(props: MapViewRenderProps): ReactNode;
  altitude(paneState: PaneState, position: MapCameraPosition): number;
}

const googleZoom = new GoogleZoomAltitudeConverter();
const mapboxZoom = new MapboxZoomAltitudeConverter();
const cesiumZoom = new CesiumZoomAltitudeConverter();
let herePlatform: H.service.Platform | null = null;

function convertedAltitude(
  position: MapCameraPosition,
  converter: {
    zoomLevelToAltitude(params: { zoomLevel: number; latitude: number; tilt: number }): number;
  },
): number {
  return converter.zoomLevelToAltitude({
    zoomLevel: position.zoom,
    latitude: position.position.latitude,
    tilt: position.tilt,
  });
}

function MissingKey({ title, envName }: { title: string; envName: string }) {
  return <div className="camera-sync-missing-key">
    <h2>{title}</h2>
    <p>Add <code>{envName}</code> to <code>examples/basic/.env</code>, or switch this pane to MapLibre.</p>
  </div>;
}

function googleAltitude(pane: PaneState, position: MapCameraPosition): number {
  if (pane.provider === 'google-maps-3d') {
    const holder = pane.mapState.getMapViewHolder() as { map?: { camera?: { altitude?: number }; cameraPosition?: { altitude?: number } }; zoomConverter?: GoogleZoomAltitudeConverter } | null;
    const actual = holder?.map?.camera?.altitude ?? holder?.map?.cameraPosition?.altitude;
    if (actual != null) return actual;
    return convertedAltitude(position, holder?.zoomConverter ?? googleZoom);
  }
  return convertedAltitude(position, googleZoom);
}

const adapters: CameraSyncProviderAdapter[] = [
  {
    id: 'maplibre', label: 'MapLibre', altitude: (_pane, position) => convertedAltitude(position, googleZoom),
    render: ({ paneState: pane, children, ...events }) => <MapLibreMapView state={pane.mapState as MapLibreViewState} {...events}>{children}</MapLibreMapView>,
  },
  {
    id: 'mapbox', label: 'Mapbox', altitude: (_pane, position) => convertedAltitude(position, mapboxZoom),
    render: props => renderMapbox(props, 'mercator'),
  },
  {
    id: 'mapbox-3d', label: 'Mapbox 3D', altitude: (_pane, position) => convertedAltitude(position, mapboxZoom),
    render: props => renderMapbox(props, 'globe'),
  },
  {
    id: 'leaflet', label: 'Leaflet', altitude: (_pane, position) => convertedAltitude(position, googleZoom),
    render: ({ paneState: pane, children, ...events }) => <LeafletMapView state={pane.mapState as LeafletMapViewState} {...events}>{children}</LeafletMapView>,
  },
  {
    id: 'openlayers', label: 'OpenLayers', altitude: (_pane, position) => convertedAltitude(position, googleZoom),
    render: ({ paneState: pane, children, ...events }) => <OpenLayersMapView state={pane.mapState as OpenLayersMapViewState} {...events}>{children}</OpenLayersMapView>,
  },
  {
    id: 'google-maps', label: 'Google Maps', altitude: googleAltitude,
    render: props => renderGoogle(props, false),
  },
  {
    id: 'google-maps-3d', label: 'Google Maps 3D', altitude: googleAltitude,
    render: props => renderGoogle(props, true),
  },
  {
    id: 'arcgis', label: 'ArcGIS 2D', altitude: (_pane, position) => convertedAltitude(position, googleZoom),
    render: ({ paneState: pane, children, ...events }) => <ArcGISMapView2D state={pane.mapState as ArcGISViewState} {...events}>{children}</ArcGISMapView2D>,
  },
  {
    id: 'arcgis-3d', label: 'ArcGIS 3D', altitude: (_pane, position) => convertedAltitude(position, googleZoom),
    render: ({ paneState: pane, children, ...events }) => <ArcGISMapView state={pane.mapState as ArcGISViewState} {...events}>{children}</ArcGISMapView>,
  },
  {
    id: 'cesium', label: 'Cesium',
    altitude: (pane, position) => {
      const holder = pane.mapState.getMapViewHolder() as { map?: { camera?: { positionCartographic?: { height?: number } } } } | null;
      return holder?.map?.camera?.positionCartographic?.height ?? convertedAltitude(position, cesiumZoom);
    },
    render: ({ paneState: pane, children, ...events }) => <CesiumMapView state={pane.mapState as CesiumMapViewState} {...events}>{children}</CesiumMapView>,
  },
  {
    id: 'here', label: 'HERE', altitude: (_pane, position) => convertedAltitude(position, googleZoom),
    render: props => renderHere(props),
  },
];

export const cameraSyncProviders: readonly CameraSyncProviderAdapter[] = adapters;
export const cameraSyncProviderById: Readonly<Record<PaneProvider, CameraSyncProviderAdapter>> = Object.fromEntries(adapters.map(adapter => [adapter.id, adapter])) as Record<PaneProvider, CameraSyncProviderAdapter>;

function renderGoogle({ paneState: pane, children, ...events }: MapViewRenderProps, is3D: boolean): ReactNode {
  const state = pane.mapState as GoogleMapViewState;
  if (!state.apiKey || state.apiKey === 'your_api_key_here') return <MissingKey title="Google Maps API Key is Missing" envName="VITE_GOOGLE_MAPS_API_KEY" />;
  if (is3D) return <GoogleMapView state={state} mapId="DEMO_MAP_ID" version="alpha" {...events}>{children}</GoogleMapView>;
  return <GoogleMapView2D state={state} mapId="DEMO_MAP_ID" version="alpha" {...events}>{children}</GoogleMapView2D>;
}

function renderMapbox({ paneState: pane, children, ...events }: MapViewRenderProps, projection: 'mercator' | 'globe'): ReactNode {
  const state = pane.mapState as MapboxViewState;
  if (!state.accessToken) return <MissingKey title="Mapbox Access Token is Missing" envName="VITE_MAPBOX_ACCESS_TOKEN" />;
  const MapView = projection === 'globe' ? MapBoxMapView : MapBoxMapView2D;
  return <MapView state={state} {...events}>{children}</MapView>;
}

function renderHere({ paneState: pane, children, ...events }: MapViewRenderProps): ReactNode {
  const apiKey = import.meta.env.VITE_HERE_API_KEY || '';
  if (!apiKey || apiKey === 'your_api_key_here') {
    return <MissingKey title="HERE API Key is Missing" envName="VITE_HERE_API_KEY" />;
  }
  herePlatform ??= new H.service.Platform({ apikey: apiKey });
  return <HereMapView2D state={pane.mapState as HereViewState} platform={herePlatform} {...events}>{children}</HereMapView2D>;
}
