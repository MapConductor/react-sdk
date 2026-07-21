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
  | 'cesium'
  | 'here';

type AnyMapViewState = MapViewStateInterface<MapDesignTypeInterface<unknown>>;

interface SingletonMapsContextValue {
  statesById: Record<SingletonMapId, AnyMapViewState>;
  register(id: SingletonMapId, content: SingletonMapContent): void;
  unregister(id: SingletonMapId, owner: string): void;
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
const LazyCesiumSingletonView = lazy(() => import('./providers/singleton/CesiumSingletonView'));
const LazyHereSingletonView = lazy(() => import('./providers/singleton/HereSingletonView'));

export function SingletonMapsProvider({ children }: { children: ReactNode }) {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const arcGISApiKey = import.meta.env.VITE_ARCGIS_API_KEY || '';
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

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
    cesium: cesiumState,
    here: hereState,
  }), [
    google2DState, google3DState, maplibre2DState, maplibre3DState, mapboxState,
    leafletState, openLayersState, arcgis2DState, arcgis3DState, cesiumState, hereState,
  ]);

  const [mounted, setMounted] = useState<Partial<Record<SingletonMapId, boolean>>>({});
  const [content, setContent] = useState<Partial<Record<SingletonMapId, SingletonMapContent | null>>>({});

  const register = useCallback((id: SingletonMapId, next: SingletonMapContent) => {
    setMounted(prev => (prev[id] ? prev : { ...prev, [id]: true }));
    setContent(prev => ({ ...prev, [id]: next }));
  }, []);

  const unregister = useCallback((id: SingletonMapId, owner: string) => {
    setContent(prev => (prev[id]?.owner === owner ? { ...prev, [id]: null } : prev));
  }, []);

  const contextValue = useMemo<SingletonMapsContextValue>(() => ({
    statesById,
    register,
    unregister,
  }), [statesById, register, unregister]);

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
  const { statesById } = useSingletonMapsContext();
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
    state.moveCameraTo(cameraPosition, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraKey, state]);

  return state;
}
