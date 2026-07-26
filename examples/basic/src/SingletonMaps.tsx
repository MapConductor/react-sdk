import {
  createContext,
  Fragment,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createGeoPoint,
  createMapCameraPosition,
  MarkerTilingOptions,
  type MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  GoogleMapView,
  GoogleMapView2D,
  useGoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import { MapLibreDesign, useMapLibreViewState } from '@mapconductor/react-for-maplibre';
import { MapboxDesign, useMapboxViewState } from '@mapconductor/react-for-mapbox';
import { LeafletDesign, useLeafletMapViewState } from '@mapconductor/react-for-leaflet';
import { OpenLayersDesign, useOpenLayersMapViewState } from '@mapconductor/react-for-openlayers';
import { ArcGISDesign, useArcGISViewState } from '@mapconductor/react-for-arcgis';
import { MapKitMapDesign, useMapKitViewState } from '@mapconductor/react-for-mapkit';
import { AzureMapsDesign, useAzureMapsViewState } from '@mapconductor/react-for-azuremaps';
import { CesiumDesign, useCesiumMapViewState } from '@mapconductor/react-for-cesium';
import { HereMapDesign, useHereViewState } from '@mapconductor/react-for-here';
import type { SingletonMapContent } from './providers/singleton/types';

export type { SingletonMapContent };

export type SingletonMapId =
  | 'google-2d'
  | 'google-3d'
  | 'maplibre-2d'
  | 'maplibre-3d'
  | 'mapbox'
  | 'leaflet'
  | 'openlayers'
  | 'arcgis-2d'
  | 'arcgis-3d'
  | 'mapkit'
  | 'azuremaps'
  | 'cesium'
  | 'here';

type AnyMapViewState = MapViewStateInterface<MapDesignTypeInterface<unknown>>;
type AnyMapDesignType = MapDesignTypeInterface<unknown>;

interface SingletonMapsContextValue {
  statesById: Record<SingletonMapId, AnyMapViewState>;
  register(id: SingletonMapId, content: SingletonMapContent): void;
  unregister(id: SingletonMapId, owner: string): void;
  // Resets the shared (singleton) map instance for `id` back to its defaults so
  // settings a previous page applied don't leak across navigation.
  resetMapState(id: SingletonMapId): void;
}

interface SingletonMapSlotProps extends Omit<SingletonMapContent, 'owner'> {
  id: SingletonMapId;
}

const DEFAULT_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  zoom: 12,
});

// Marker tiling is provider configuration, so it cannot vary per page without
// recreating the singleton map. Use one application-wide policy. The scale
// stops retain the post-office sample's large-marker behavior.
const SINGLETON_MARKER_TILING_OPTIONS: MarkerTilingOptions = {
  ...MarkerTilingOptions.Default,
  iconScaleCallback: (_state, zoom) => {
    if (zoom > 10) return 0.8;
    if (zoom > 5) return 0.5;
    return 0.2;
  },
};

const SingletonMapsContext = createContext<SingletonMapsContextValue | null>(null);

function useSingletonMapsContext(): SingletonMapsContextValue {
  const value = useContext(SingletonMapsContext);
  if (!value) {
    throw new Error('SingletonMapsProvider is missing');
  }
  return value;
}

function MissingGoogleMapsApiKey() {
  return (
    <div className="singleton-map-message">
      <h2>Google Maps API Key is Missing</h2>
      <p>To use the Google Maps provider, create an <code>.env</code> file in this example.</p>
      <pre>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
    </div>
  );
}

const LazyMapLibreSingletonView = lazy(() => import('./providers/singleton/MapLibreSingletonView'));
const LazyMapboxSingletonView = lazy(() => import('./providers/singleton/MapboxSingletonView'));
const LazyLeafletSingletonView = lazy(() => import('./providers/singleton/LeafletSingletonView'));
const LazyOpenLayersSingletonView = lazy(() => import('./providers/singleton/OpenLayersSingletonView'));
const LazyArcGISSingletonView = lazy(() => import('./providers/singleton/ArcGISSingletonView'));
const LazyMapKitSingletonView = lazy(() => import('./providers/singleton/MapKitSingletonView'));
const LazyAzureMapsSingletonView = lazy(() => import('./providers/singleton/AzureMapsSingletonView'));
const LazyCesiumSingletonView = lazy(() => import('./providers/singleton/CesiumSingletonView'));
const LazyHereSingletonView = lazy(() => import('./providers/singleton/HereSingletonView'));

export function SingletonMapsProvider({ children }: { children: ReactNode }) {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const arcGISApiKey = import.meta.env.VITE_ARCGIS_API_KEY || '';
  const mapKitToken = import.meta.env.VITE_MAPKIT_TOKEN || '';
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const azureMapsKey = import.meta.env.VITE_AZURE_MAPS_SUBSCRIOTION_KEY || '';

  // Each use<Provider>ViewState() hook only creates lightweight camera/config
  // state (no heavy SDK import), so calling all of them eagerly here is
  // cheap. The actual heavy map view components are loaded lazily below and
  // mounted only once their provider is first visited, then kept mounted
  // forever so the underlying map instance survives navigation.
  const google2DState = useGoogleMapViewState({ apiKey: googleApiKey, mapDesignType: GoogleMapDesign.Normal, cameraPosition: DEFAULT_CAMERA });
  const google3DState = useGoogleMapViewState({ apiKey: googleApiKey, mapDesignType: GoogleMapDesign.Normal, cameraPosition: DEFAULT_CAMERA });
  const maplibre2DState = useMapLibreViewState({ mapDesignType: MapLibreDesign.OsmBrightJa, cameraPosition: DEFAULT_CAMERA });
  const maplibre3DState = useMapLibreViewState({ mapDesignType: MapLibreDesign.OsmBrightJa, cameraPosition: DEFAULT_CAMERA });
  const mapboxState = useMapboxViewState({ accessToken: mapboxAccessToken, mapDesignType: MapboxDesign.Streets, cameraPosition: DEFAULT_CAMERA });
  const leafletState = useLeafletMapViewState({ mapDesignType: LeafletDesign.OpenStreetMap, cameraPosition: DEFAULT_CAMERA });
  const openLayersState = useOpenLayersMapViewState({ mapDesignType: OpenLayersDesign.OpenStreetMap, cameraPosition: DEFAULT_CAMERA });
  const arcgis2DState = useArcGISViewState({ apiKey: arcGISApiKey, mapDesignType: ArcGISDesign.Streets, cameraPosition: DEFAULT_CAMERA });
  const arcgis3DState = useArcGISViewState({ apiKey: arcGISApiKey, mapDesignType: ArcGISDesign.Streets, cameraPosition: DEFAULT_CAMERA });
  const mapkitState = useMapKitViewState({ token: mapKitToken, mapDesignType: MapKitMapDesign.Standard, cameraPosition: DEFAULT_CAMERA });
  const azuremapsState = useAzureMapsViewState({ subscriptionKey: azureMapsKey, mapDesignType: AzureMapsDesign.Road, cameraPosition: DEFAULT_CAMERA });
  const cesiumState = useCesiumMapViewState({ mapDesignType: CesiumDesign.Default, cameraPosition: DEFAULT_CAMERA });
  const hereState = useHereViewState({ mapDesignType: HereMapDesign.NormalDay, cameraPosition: DEFAULT_CAMERA });

  const statesById = useMemo<Record<SingletonMapId, AnyMapViewState>>(() => ({
    'google-2d': google2DState,
    'google-3d': google3DState,
    'maplibre-2d': maplibre2DState,
    'maplibre-3d': maplibre3DState,
    mapbox: mapboxState,
    leaflet: leafletState,
    openlayers: openLayersState,
    'arcgis-2d': arcgis2DState,
    'arcgis-3d': arcgis3DState,
    mapkit: mapkitState,
    azuremaps: azuremapsState,
    cesium: cesiumState,
    here: hereState,
  }), [
    google2DState, google3DState, maplibre2DState, maplibre3DState, mapboxState,
    leafletState, openLayersState, arcgis2DState, arcgis3DState, mapkitState, azuremapsState, cesiumState, hereState,
  ]);

  // Capture each provider's default map design once, up front, before any page
  // can mutate the shared state's mapDesignType. resetMapState() restores these.
  const defaultDesignsRef = useRef<Record<SingletonMapId, AnyMapDesignType> | null>(null);
  if (!defaultDesignsRef.current) {
    defaultDesignsRef.current = Object.fromEntries(
      (Object.keys(statesById) as SingletonMapId[]).map(id => [id, statesById[id].mapDesignType]),
    ) as Record<SingletonMapId, AnyMapDesignType>;
  }

  const [mounted, setMounted] = useState<Partial<Record<SingletonMapId, boolean>>>({});
  const [content, setContent] = useState<Partial<Record<SingletonMapId, SingletonMapContent | null>>>({});

  const register = useCallback((id: SingletonMapId, next: SingletonMapContent) => {
    setMounted(prev => (prev[id] ? prev : { ...prev, [id]: true }));
    setContent(prev => ({ ...prev, [id]: next }));
  }, []);

  const unregister = useCallback((id: SingletonMapId, owner: string) => {
    setContent(prev => (prev[id]?.owner === owner ? { ...prev, [id]: null } : prev));
  }, []);

  // Every provider is driven by a single shared map instance kept alive across
  // navigation (see the comment on MapViewContainer). That means view-level
  // settings a page changes — the map design and the camera's bearing/tilt —
  // would otherwise persist into the next page. Reset them to a clean baseline
  // on each page entry (useSingletonMapState calls this before applying the new
  // page's initialCamera).
  //
  // minZoom / maxZoom / restrictBounds are intentionally not handled here: they
  // are baked into a map at creation time and are never applied to a singleton
  // instance (pages that need them opt into a dedicated, per-mount instance in
  // MapViewContainer), so there is nothing to reset for those.
  const resetMapState = useCallback((id: SingletonMapId) => {
    const state = statesById[id];
    const defaultDesign = defaultDesignsRef.current?.[id];
    if (!state || !defaultDesign) return;

    if (state.mapDesignType.id !== defaultDesign.id) {
      state.mapDesignType = defaultDesign;
    }

    // Neutral top-down orientation. Position/zoom are left untouched because the
    // page's own initialCamera is applied right after this, which also re-applies
    // any tilt/bearing a page intentionally wants (e.g. the Tilt sample).
    if (state.cameraPosition.bearing !== 0 || state.cameraPosition.tilt !== 0) {
      state.moveCameraTo(
        createMapCameraPosition({
          position: state.cameraPosition.position,
          zoom: state.cameraPosition.zoom,
          bearing: 0,
          tilt: 0,
        }),
        0,
      );
    }
  }, [statesById]);

  const contextValue = useMemo<SingletonMapsContextValue>(() => ({
    statesById,
    register,
    unregister,
    resetMapState,
  }), [statesById, register, unregister, resetMapState]);

  const hasGoogleKey = Boolean(googleApiKey && googleApiKey !== 'your_api_key_here');

  const layers: { id: SingletonMapId; node: ReactNode }[] = [
    {
      id: 'google-2d',
      node: hasGoogleKey ? (
        <GoogleMapView2D
          state={google2DState}
          mapId="DEMO_MAP_ID"
          version="alpha"
          libraries="maps3d"
          markerTilingOptions={SINGLETON_MARKER_TILING_OPTIONS}
          onMapClick={content['google-2d']?.onMapClick}
          onCameraMoveStart={content['google-2d']?.onCameraMoveStart}
          onCameraMove={content['google-2d']?.onCameraMove}
          onCameraMoveEnd={content['google-2d']?.onCameraMoveEnd}
        >
          {content['google-2d'] && <Fragment key={content['google-2d']!.owner}>{content['google-2d']!.children}</Fragment>}
        </GoogleMapView2D>
      ) : <MissingGoogleMapsApiKey />,
    },
    {
      id: 'google-3d',
      node: hasGoogleKey ? (
        <GoogleMapView
          state={google3DState}
          mapId="DEMO_MAP_ID"
          version="alpha"
          markerTilingOptions={SINGLETON_MARKER_TILING_OPTIONS}
          onMapClick={content['google-3d']?.onMapClick}
          onCameraMoveStart={content['google-3d']?.onCameraMoveStart}
          onCameraMove={content['google-3d']?.onCameraMove}
          onCameraMoveEnd={content['google-3d']?.onCameraMoveEnd}
        >
          {content['google-3d'] && <Fragment key={content['google-3d']!.owner}>{content['google-3d']!.children}</Fragment>}
        </GoogleMapView>
      ) : <MissingGoogleMapsApiKey />,
    },
    {
      id: 'maplibre-2d',
      node: <Suspense fallback={null}><LazyMapLibreSingletonView state={maplibre2DState} content={content['maplibre-2d'] ?? null} useGlobe={false} /></Suspense>,
    },
    {
      id: 'maplibre-3d',
      node: <Suspense fallback={null}><LazyMapLibreSingletonView state={maplibre3DState} content={content['maplibre-3d'] ?? null} useGlobe /></Suspense>,
    },
    {
      id: 'mapbox',
      node: <Suspense fallback={null}><LazyMapboxSingletonView state={mapboxState} content={content['mapbox'] ?? null} /></Suspense>,
    },
    {
      id: 'leaflet',
      node: <Suspense fallback={null}><LazyLeafletSingletonView state={leafletState} content={content['leaflet'] ?? null} /></Suspense>,
    },
    {
      id: 'openlayers',
      node: <Suspense fallback={null}><LazyOpenLayersSingletonView state={openLayersState} content={content['openlayers'] ?? null} /></Suspense>,
    },
    {
      id: 'arcgis-2d',
      node: <Suspense fallback={null}><LazyArcGISSingletonView state={arcgis2DState} content={content['arcgis-2d'] ?? null} useSceneView={false} /></Suspense>,
    },
    {
      id: 'arcgis-3d',
      node: <Suspense fallback={null}><LazyArcGISSingletonView state={arcgis3DState} content={content['arcgis-3d'] ?? null} useSceneView /></Suspense>,
    },
    {
      id: 'mapkit',
      node: <Suspense fallback={null}><LazyMapKitSingletonView state={mapkitState} content={content['mapkit'] ?? null} /></Suspense>,
    },
    {
      id: 'azuremaps',
      node: <Suspense fallback={null}><LazyAzureMapsSingletonView state={azuremapsState} content={content['azuremaps'] ?? null} /></Suspense>,
    },
    {
      id: 'cesium',
      node: <Suspense fallback={null}><LazyCesiumSingletonView state={cesiumState} content={content['cesium'] ?? null} /></Suspense>,
    },
    {
      id: 'here',
      node: <Suspense fallback={null}><LazyHereSingletonView state={hereState} content={content['here'] ?? null} /></Suspense>,
    },
  ];

  return (
    <SingletonMapsContext.Provider value={contextValue}>
      {layers.map(layer => mounted[layer.id] && (
        <div key={layer.id} className={`singleton-map-layer ${content[layer.id] ? 'active' : ''}`}>
          {layer.node}
        </div>
      ))}
      {children}
    </SingletonMapsContext.Provider>
  );
}

export function SingletonMapSlot({ id, children, onMapClick, onCameraMoveStart, onCameraMove, onCameraMoveEnd }: SingletonMapSlotProps) {
  const { register, unregister } = useSingletonMapsContext();
  const owner = useId();

  useLayoutEffect(() => {
    register(id, {
      owner,
      children,
      onMapClick,
      onCameraMoveStart,
      onCameraMove,
      onCameraMoveEnd,
    });
    return () => unregister(id, owner);
  }, [
    id,
    owner,
    children,
    onMapClick,
    onCameraMoveStart,
    onCameraMove,
    onCameraMoveEnd,
    register,
    unregister,
  ]);

  return null;
}

export function useSingletonMapState(id: SingletonMapId, cameraPosition: MapCameraPosition): AnyMapViewState {
  const { statesById, resetMapState } = useSingletonMapsContext();
  const state = statesById[id];
  const cameraKey = [
    cameraPosition.position.latitude,
    cameraPosition.position.longitude,
    cameraPosition.position.altitude ?? 0,
    cameraPosition.zoom,
    cameraPosition.bearing,
    cameraPosition.tilt,
  ].join(':');

  useLayoutEffect(() => {
    // Reset the shared instance to its defaults, then apply this page's camera.
    resetMapState(id);
    state.moveCameraTo(cameraPosition, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraKey, state, id, resetMapState]);

  return state;
}
