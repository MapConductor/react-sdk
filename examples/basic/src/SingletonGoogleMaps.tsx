import {
  createGeoPoint,
  createMapCameraPosition,
  MarkerTilingOptions,
  type GeoPoint,
  type MapCameraPosition,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  GoogleMapView,
  GoogleMapView2D,
  useGoogleMapViewState,
  type GoogleMapDesignType,
  type GoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

type GoogleMapMode = '2d' | '3d';

interface SingletonMapContent {
  owner: string;
  children?: ReactNode;
  onMapClick?: (point: GeoPoint) => void;
  onCameraMoveStart?: (camera: MapCameraPosition) => void;
  onCameraMove?: (camera: MapCameraPosition) => void;
  onCameraMoveEnd?: (camera: MapCameraPosition) => void;
}

interface SingletonGoogleMapsContextValue {
  google2DState: GoogleMapViewState;
  google3DState: GoogleMapViewState;
  register(mode: GoogleMapMode, content: SingletonMapContent): void;
  unregister(mode: GoogleMapMode, owner: string): void;
}

interface SingletonGoogleMapSlotProps extends Omit<SingletonMapContent, 'owner'> {
  mode: GoogleMapMode;
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

const SingletonGoogleMapsContext = createContext<SingletonGoogleMapsContextValue | null>(null);

function useSingletonGoogleMapsContext(): SingletonGoogleMapsContextValue {
  const value = useContext(SingletonGoogleMapsContext);
  if (!value) {
    throw new Error('SingletonGoogleMapsProvider is missing');
  }
  return value;
}

function MissingGoogleMapsApiKey() {
  return (
    <div className="singleton-google-map-message">
      <h2>Google Maps API Key is Missing</h2>
      <p>To use the Google Maps provider, create an <code>.env</code> file in this example.</p>
      <pre>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
    </div>
  );
}

export function SingletonGoogleMapsProvider({ children }: { children: ReactNode }) {
  const google2DState = useGoogleMapViewState({
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: DEFAULT_CAMERA,
  });
  const google3DState = useGoogleMapViewState({
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: DEFAULT_CAMERA,
  });
  const [google2DContent, setGoogle2DContent] = useState<SingletonMapContent | null>(null);
  const [google3DContent, setGoogle3DContent] = useState<SingletonMapContent | null>(null);
  const [hasMounted2D, setHasMounted2D] = useState(false);
  const [hasMounted3D, setHasMounted3D] = useState(false);

  const register = useCallback((mode: GoogleMapMode, content: SingletonMapContent) => {
    if (mode === '2d') {
      setHasMounted2D(true);
      setGoogle2DContent(content);
    } else {
      setHasMounted3D(true);
      setGoogle3DContent(content);
    }
  }, []);

  const unregister = useCallback((mode: GoogleMapMode, owner: string) => {
    const clearOwner = (current: SingletonMapContent | null) =>
      current?.owner === owner ? null : current;
    if (mode === '2d') {
      setGoogle2DContent(clearOwner);
    } else {
      setGoogle3DContent(clearOwner);
    }
  }, []);

  const contextValue = useMemo<SingletonGoogleMapsContextValue>(() => ({
    google2DState,
    google3DState,
    register,
    unregister,
  }), [google2DState, google3DState, register, unregister]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey && apiKey !== 'your_api_key_here');

  return (
    <SingletonGoogleMapsContext.Provider value={contextValue}>
      {hasMounted2D && (
        <div className={`singleton-google-map-layer ${google2DContent ? 'active' : ''}`}>
          {hasApiKey ? (
            <GoogleMapView2D
              state={google2DState}
              apiKey={apiKey}
              mapId="DEMO_MAP_ID"
              version="alpha"
              libraries="map3d"
              markerTilingOptions={SINGLETON_MARKER_TILING_OPTIONS}
              onMapClick={google2DContent?.onMapClick}
              onCameraMoveStart={google2DContent?.onCameraMoveStart}
              onCameraMove={google2DContent?.onCameraMove}
              onCameraMoveEnd={google2DContent?.onCameraMoveEnd}
            >
              {google2DContent && (
                <Fragment key={google2DContent.owner}>{google2DContent.children}</Fragment>
              )}
            </GoogleMapView2D>
          ) : (
            <MissingGoogleMapsApiKey />
          )}
        </div>
      )}

      {hasMounted3D && (
        <div className={`singleton-google-map-layer ${google3DContent ? 'active' : ''}`}>
          {hasApiKey ? (
            <GoogleMapView
              state={google3DState}
              apiKey={apiKey}
              mapId="DEMO_MAP_ID"
              version="alpha"
              markerTilingOptions={SINGLETON_MARKER_TILING_OPTIONS}
              onMapClick={google3DContent?.onMapClick}
              onCameraMoveStart={google3DContent?.onCameraMoveStart}
              onCameraMove={google3DContent?.onCameraMove}
              onCameraMoveEnd={google3DContent?.onCameraMoveEnd}
            >
              {google3DContent && (
                <Fragment key={google3DContent.owner}>{google3DContent.children}</Fragment>
              )}
            </GoogleMapView>
          ) : (
            <MissingGoogleMapsApiKey />
          )}
        </div>
      )}

      {children}
    </SingletonGoogleMapsContext.Provider>
  );
}

export function SingletonGoogleMapSlot({
  mode,
  children,
  onMapClick,
  onCameraMoveStart,
  onCameraMove,
  onCameraMoveEnd,
}: SingletonGoogleMapSlotProps) {
  const { register, unregister } = useSingletonGoogleMapsContext();
  const owner = useId();

  useLayoutEffect(() => {
    register(mode, {
      owner,
      children,
      onMapClick,
      onCameraMoveStart,
      onCameraMove,
      onCameraMoveEnd,
    });
    return () => unregister(mode, owner);
  }, [
    mode,
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

export function useSingletonGoogleMapViewState(
  cameraPosition: MapCameraPosition,
  mapDesignType: GoogleMapDesignType = GoogleMapDesign.Normal,
): GoogleMapViewState {
  const location = useLocation();
  const { google2DState, google3DState } = useSingletonGoogleMapsContext();
  const is3D = location.pathname.startsWith('/google-maps-3d');
  const state = is3D ? google3DState : google2DState;
  const isGoogle = location.pathname.startsWith('/google-maps');
  const cameraKey = [
    cameraPosition.position.latitude,
    cameraPosition.position.longitude,
    cameraPosition.position.altitude ?? 0,
    cameraPosition.zoom,
    cameraPosition.bearing,
    cameraPosition.tilt,
  ].join(':');

  useLayoutEffect(() => {
    if (!isGoogle) return;
    state.mapDesignType = mapDesignType;
    state.moveCameraTo(cameraPosition, 0);
  }, [cameraKey, cameraPosition, isGoogle, mapDesignType, mapDesignType.id, state]);

  return state;
}
