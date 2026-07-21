import {
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import {
  MapboxDesign,
  useMapboxViewState,
} from '@mapconductor/react-for-mapbox';
import {
  LeafletDesign,
  useLeafletMapViewState,
} from '@mapconductor/react-for-leaflet';
import {
  OpenLayersDesign,
  useOpenLayersMapViewState,
} from '@mapconductor/react-for-openlayers';
import {
  ArcGISDesign,
  useArcGISViewState,
} from '@mapconductor/react-for-arcgis';
import {
  CesiumDesign,
  useCesiumMapViewState,
} from '@mapconductor/react-for-cesium';
import { INITIAL_CAMERA } from './cameraSyncData';
import type { PaneProvider, PaneState } from './types';
import { HereMapDesign, useHereViewState } from '@mapconductor/react-for-here';

type ProviderStateMap = Record<PaneProvider, PaneState>;

function paneState(provider: PaneProvider, mapState: MapViewStateInterface<MapDesignTypeInterface<unknown>>): PaneState {
  return { provider, mapState };
}

export function useCameraSyncProviderStates(prefix: 'left' | 'right'): ProviderStateMap {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const arcGISApiKey = import.meta.env.VITE_ARCGIS_API_KEY || '';
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const mapLibreState = useMapLibreViewState({ id: `camera-sync-${prefix}-maplibre`, mapDesignType: prefix === 'left' ? MapLibreDesign.OsmBrightJa : MapLibreDesign.MapTilerBasicJa, cameraPosition: INITIAL_CAMERA });
  const mapboxState = useMapboxViewState({ id: `camera-sync-${prefix}-mapbox`, accessToken: mapboxAccessToken, mapDesignType: prefix === 'left' ? MapboxDesign.Streets : MapboxDesign.Light, cameraPosition: INITIAL_CAMERA });
  const mapbox3DState = useMapboxViewState({ id: `camera-sync-${prefix}-mapbox-3d`, accessToken: mapboxAccessToken, mapDesignType: prefix === 'left' ? MapboxDesign.Outdoors : MapboxDesign.SatelliteStreets, cameraPosition: INITIAL_CAMERA });
  const leafletState = useLeafletMapViewState({ id: `camera-sync-${prefix}-leaflet`, mapDesignType: LeafletDesign.OpenStreetMap, cameraPosition: INITIAL_CAMERA });
  const openLayersState = useOpenLayersMapViewState({ id: `camera-sync-${prefix}-openlayers`, mapDesignType: OpenLayersDesign.OpenStreetMap, cameraPosition: INITIAL_CAMERA });
  const google2DState = useGoogleMapViewState({ id: `camera-sync-${prefix}-google-2d`, apiKey: googleMapsApiKey, mapDesignType: GoogleMapDesign.Normal, cameraPosition: INITIAL_CAMERA });
  const google3DState = useGoogleMapViewState({ id: `camera-sync-${prefix}-google-3d`, apiKey: googleMapsApiKey, mapDesignType: GoogleMapDesign.Normal, cameraPosition: INITIAL_CAMERA });
  const arcGISState = useArcGISViewState({ id: `camera-sync-${prefix}-arcgis-2d`, apiKey: arcGISApiKey, mapDesignType: ArcGISDesign.Streets, cameraPosition: INITIAL_CAMERA });
  const arcGIS3DState = useArcGISViewState({ id: `camera-sync-${prefix}-arcgis-3d`, apiKey: arcGISApiKey, mapDesignType: ArcGISDesign.OsmStandard, cameraPosition: INITIAL_CAMERA });
  const cesiumState = useCesiumMapViewState({ id: `camera-sync-${prefix}-cesium`, mapDesignType: CesiumDesign.Default, cameraPosition: INITIAL_CAMERA });
  const hereState = useHereViewState({ id: `camera-sync-${prefix}-here`, mapDesignType: HereMapDesign.NormalDay, cameraPosition: INITIAL_CAMERA });

  return {
    maplibre: paneState('maplibre', mapLibreState),
    mapbox: paneState('mapbox', mapboxState),
    'mapbox-3d': paneState('mapbox-3d', mapbox3DState),
    leaflet: paneState('leaflet', leafletState),
    openlayers: paneState('openlayers', openLayersState),
    'google-maps': paneState('google-maps', google2DState),
    'google-maps-3d': paneState('google-maps-3d', google3DState),
    arcgis: paneState('arcgis', arcGISState),
    'arcgis-3d': paneState('arcgis-3d', arcGIS3DState),
    cesium: paneState('cesium', cesiumState),
    here: paneState('here', hereState),
  };
}
