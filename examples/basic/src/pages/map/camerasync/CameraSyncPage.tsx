import { useMemo, useRef, useState } from 'react';
import {
  createGeoPoint,
  createMapCameraPosition,
  createPolygonState,
  createPolylineState,
  type GeoPoint,
  type MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type PolygonState,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import { Polygon, Polyline } from '@mapconductor/js-sdk-react';
import {
  GoogleMapDesign,
  GoogleMapView,
  GoogleMapView2D,
  useGoogleMapViewState,
  type GoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  MapLibreView,
  useMapLibreViewState,
  type MapLibreViewState,
} from '@mapconductor/react-for-maplibre';

type PaneId = 'left' | 'right';
type PaneProvider = 'maplibre' | 'google-maps' | 'google-maps-3d';

interface CameraLocationInfo {
  name: string;
  bounds: {
    southWest: GeoPoint;
    northEast: GeoPoint;
  };
  center: GeoPoint;
  zoom: number;
}

interface ProgrammaticMoveState {
  key: number | null;
  target: MapCameraPosition | null;
  untilMs: number;
  sinceMs: number;
}

interface PairedFlyToState {
  active: boolean;
  untilMs: number;
  leftEnded: boolean;
  rightEnded: boolean;
}

interface PaneState {
  provider: PaneProvider;
  mapState: MapViewStateInterface<MapDesignTypeInterface<unknown>>;
}

const INITIAL_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

const PROGRAMMATIC_TTL_MS = 1200;
const PROGRAMMATIC_GRACE_MS = 250;
const MOVE_SYNC_INTERVAL_MS = 33;
const FLY_TO_DURATION_MS = 1000;

function cameraKey(camera: MapCameraPosition): number {
  const latE5 = Math.trunc(camera.position.latitude * 1e5);
  const lonE5 = Math.trunc(camera.position.longitude * 1e5);
  const zoom100 = Math.trunc(camera.zoom * 100);
  const bearing10 = Math.trunc(camera.bearing * 10);
  return (((latE5 * 31 + lonE5) * 31 + zoom100) * 31 + bearing10);
}

function bearingDeltaDeg(a: number, b: number): number {
  const d = ((a - b) % 360 + 360) % 360;
  return d > 180 ? 360 - d : d;
}

function isCloseToTarget(camera: MapCameraPosition, target: MapCameraPosition): boolean {
  return (
    Math.abs(camera.position.latitude - target.position.latitude) < 0.0012 &&
    Math.abs(camera.position.longitude - target.position.longitude) < 0.0012 &&
    Math.abs(camera.zoom - target.zoom) < 0.75 &&
    bearingDeltaDeg(camera.bearing, target.bearing) < 12 &&
    Math.abs(camera.tilt - target.tilt) < 6
  );
}

function markProgrammaticMove(
  ref: React.MutableRefObject<ProgrammaticMoveState>,
  target: MapCameraPosition,
  nowMs: number,
  ttlMs = PROGRAMMATIC_TTL_MS,
) {
  ref.current = {
    key: cameraKey(target),
    target,
    sinceMs: nowMs,
    untilMs: nowMs + ttlMs,
  };
}

function clearProgrammaticMove(ref: React.MutableRefObject<ProgrammaticMoveState>) {
  ref.current = { key: null, target: null, sinceMs: 0, untilMs: 0 };
}

function clearPairedFlyTo(ref: React.MutableRefObject<PairedFlyToState>) {
  ref.current = { active: false, untilMs: 0, leftEnded: false, rightEnded: false };
}

function isProgrammaticMove(
  ref: React.MutableRefObject<ProgrammaticMoveState>,
  camera: MapCameraPosition,
  nowMs: number,
): boolean {
  const state = ref.current;
  if (state.key == null || nowMs > state.untilMs) return false;
  if (cameraKey(camera) === state.key) return true;
  return state.target ? isCloseToTarget(camera, state.target) : false;
}

function defaultLocations(): CameraLocationInfo[] {
  return [
    {
      name: 'Tokyo',
      bounds: {
        southWest: createGeoPoint({ latitude: 35.62, longitude: 139.7, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 35.74, longitude: 139.84, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
      zoom: 12,
    },
    {
      name: 'French Southern and Antarctic Lands',
      bounds: {
        southWest: createGeoPoint({ latitude: -49.5, longitude: 50, altitude: 0 }),
        northEast: createGeoPoint({ latitude: -37.5, longitude: 77, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: -43.5, longitude: 63.5, altitude: 0 }),
      zoom: 4,
    },
    {
      name: 'Finland',
      bounds: {
        southWest: createGeoPoint({ latitude: 59.8, longitude: 19.1, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 70.1, longitude: 31.6, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 64.95, longitude: 25.35, altitude: 0 }),
      zoom: 5,
    },
    {
      name: 'Iceland',
      bounds: {
        southWest: createGeoPoint({ latitude: 63.3, longitude: -24.5, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 66.6, longitude: -13.5, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 64.95, longitude: -19, altitude: 0 }),
      zoom: 6,
    },
    {
      name: 'Kiribati',
      bounds: {
        southWest: createGeoPoint({ latitude: -11.5, longitude: -174.5, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 5, longitude: -147, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: -3.25, longitude: -160.75, altitude: 0 }),
      zoom: 4.5,
    },
    {
      name: 'Oahu Island',
      bounds: {
        southWest: createGeoPoint({ latitude: 21.25, longitude: -158.3, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 21.7, longitude: -157.65, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 21.475, longitude: -157.975, altitude: 0 }),
      zoom: 9.5,
    },
  ];
}

function boundsPolyline(location: CameraLocationInfo, index: number): PolylineState {
  const sw = location.bounds.southWest;
  const ne = location.bounds.northEast;
  return createPolylineState({
    id: `camera_sync_bounds_${index}`,
    points: [
      sw,
      createGeoPoint({ latitude: sw.latitude, longitude: ne.longitude, altitude: 0 }),
      ne,
      createGeoPoint({ latitude: ne.latitude, longitude: sw.longitude, altitude: 0 }),
      sw,
    ],
    strokeColor: '#dc2626',
    strokeWidth: 3,
    geodesic: true,
  });
}

function referenceRectangles(locations: CameraLocationInfo[]): PolygonState[] {
  const size = 1;
  return locations.map((location, index) => {
    const lat = location.center.latitude;
    const lng = location.center.longitude;
    return createPolygonState({
      id: `camera_sync_reference_${index}`,
      points: [
        createGeoPoint({ latitude: lat - size / 2, longitude: lng - size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat - size / 2, longitude: lng + size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat + size / 2, longitude: lng + size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat + size / 2, longitude: lng - size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat - size / 2, longitude: lng - size / 2, altitude: 0 }),
      ],
      strokeColor: '#2563eb',
      strokeWidth: 2,
      fillColor: 'rgba(37, 99, 235, 0.1)',
      geodesic: false,
      zIndex: 1,
    });
  });
}

function usePaneState(
  provider: PaneProvider,
  mapLibreState: MapLibreViewState,
  google2DState: GoogleMapViewState,
  google3DState: GoogleMapViewState,
): PaneState {
  if (provider === 'google-maps') {
    return { provider, mapState: google2DState as MapViewStateInterface<MapDesignTypeInterface<unknown>> };
  }
  if (provider === 'google-maps-3d') {
    return { provider, mapState: google3DState as MapViewStateInterface<MapDesignTypeInterface<unknown>> };
  }
  return { provider, mapState: mapLibreState as MapViewStateInterface<MapDesignTypeInterface<unknown>> };
}

function providerLabel(provider: PaneProvider): string {
  if (provider === 'google-maps') return 'Google Maps';
  if (provider === 'google-maps-3d') return 'Google Maps 3D';
  return 'MapLibre';
}

function CameraInfoCard({ label, position }: { label: string; position: MapCameraPosition }) {
  return (
    <div className="camera-sync-info">
      <strong>{label}</strong>
      <span>Lat: {position.position.latitude.toFixed(5)}</span>
      <span>Lng: {position.position.longitude.toFixed(5)}</span>
      <span>Zoom: {position.zoom.toFixed(2)}</span>
      <span>Tilt: {position.tilt.toFixed(1)}deg</span>
      <span>Bearing: {position.bearing.toFixed(1)}deg</span>
      <span>Alt: {(position.position.altitude ?? 0).toFixed(0)} m</span>
    </div>
  );
}

function CameraSyncMapView({
  paneState,
  children,
  onCameraMove,
  onCameraMoveEnd,
}: {
  paneState: PaneState;
  children: React.ReactNode;
  onCameraMove: (camera: MapCameraPosition) => void;
  onCameraMoveEnd: (camera: MapCameraPosition) => void;
}) {
  if (paneState.provider === 'google-maps' || paneState.provider === 'google-maps-3d') {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey || apiKey === 'your_api_key_here') {
      return (
        <div className="camera-sync-missing-key">
          <h2>Google Maps API Key is Missing</h2>
          <p>Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to <code>examples/basic/.env</code>, or switch this pane to MapLibre.</p>
        </div>
      );
    }

    if (paneState.provider === 'google-maps-3d') {
      return (
        <GoogleMapView
          state={paneState.mapState as GoogleMapViewState}
          apiKey={apiKey}
          mapId="DEMO_MAP_ID"
          version="alpha"
          onCameraMove={onCameraMove}
          onCameraMoveEnd={onCameraMoveEnd}
        >
          {children}
        </GoogleMapView>
      );
    }

    return (
      <GoogleMapView2D
        state={paneState.mapState as GoogleMapViewState}
        apiKey={apiKey}
        mapId="DEMO_MAP_ID"
        version="alpha"
        onCameraMove={onCameraMove}
        onCameraMoveEnd={onCameraMoveEnd}
      >
        {children}
      </GoogleMapView2D>
    );
  }

  return (
    <MapLibreView
      state={paneState.mapState as MapLibreViewState}
      projection="globe"
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {children}
    </MapLibreView>
  );
}

function CameraSyncMapPane({
  label,
  paneState,
  selectedProvider,
  onProviderChange,
  cameraPosition,
  onCameraMove,
  onCameraMoveEnd,
  boundsPolylines,
  referenceRectangles,
}: {
  label: string;
  paneState: PaneState;
  selectedProvider: PaneProvider;
  onProviderChange: (provider: PaneProvider) => void;
  cameraPosition: MapCameraPosition;
  onCameraMove: (position: MapCameraPosition) => void;
  onCameraMoveEnd: (position: MapCameraPosition) => void;
  boundsPolylines: PolylineState[];
  referenceRectangles: PolygonState[];
}) {
  return (
    <section className="camera-sync-pane">
      <CameraSyncMapView
        paneState={paneState}
        onCameraMove={onCameraMove}
        onCameraMoveEnd={onCameraMoveEnd}
      >
        {boundsPolylines.map(polyline => <Polyline key={polyline.id} state={polyline} />)}
        {referenceRectangles.map(polygon => <Polygon key={polygon.id} state={polygon} />)}
      </CameraSyncMapView>

      <label className="camera-sync-provider">
        <span>{label}</span>
        <select value={selectedProvider} onChange={event => onProviderChange(event.target.value as PaneProvider)}>
          <option value="maplibre">MapLibre</option>
          <option value="google-maps">Google Maps</option>
          <option value="google-maps-3d">Google Maps 3D</option>
        </select>
      </label>

      <CameraInfoCard label={label} position={cameraPosition} />
    </section>
  );
}

export function CameraSyncPage() {
  const locations = useMemo(defaultLocations, []);
  const boundsPolylines = useMemo(() => locations.map(boundsPolyline), [locations]);
  const rectangles = useMemo(() => referenceRectangles(locations), [locations]);

  const leftMapLibreState = useMapLibreViewState({
    id: 'camera-sync-left-maplibre',
    mapDesignType: MapLibreDesign.OsmBrightJa,
    cameraPosition: INITIAL_CAMERA,
  });
  const rightMapLibreState = useMapLibreViewState({
    id: 'camera-sync-right-maplibre',
    mapDesignType: MapLibreDesign.MapTilerBasicJa,
    cameraPosition: INITIAL_CAMERA,
  });
  const leftGoogle2DState = useGoogleMapViewState({
    id: 'camera-sync-left-google-2d',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });
  const rightGoogle2DState = useGoogleMapViewState({
    id: 'camera-sync-right-google-2d',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });
  const leftGoogle3DState = useGoogleMapViewState({
    id: 'camera-sync-left-google-3d',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });
  const rightGoogle3DState = useGoogleMapViewState({
    id: 'camera-sync-right-google-3d',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });

  const [leftProvider, setLeftProvider] = useState<PaneProvider>('maplibre');
  const [rightProvider, setRightProvider] = useState<PaneProvider>('google-maps-3d');
  const [leftCameraPosition, setLeftCameraPosition] = useState(INITIAL_CAMERA);
  const [rightCameraPosition, setRightCameraPosition] = useState(INITIAL_CAMERA);

  const leftPaneState = usePaneState(leftProvider, leftMapLibreState, leftGoogle2DState, leftGoogle3DState);
  const rightPaneState = usePaneState(rightProvider, rightMapLibreState, rightGoogle2DState, rightGoogle3DState);

  const leftProgrammaticRef = useRef<ProgrammaticMoveState>({ key: null, target: null, sinceMs: 0, untilMs: 0 });
  const rightProgrammaticRef = useRef<ProgrammaticMoveState>({ key: null, target: null, sinceMs: 0, untilMs: 0 });
  const pairedFlyToRef = useRef<PairedFlyToState>({
    active: false,
    untilMs: 0,
    leftEnded: false,
    rightEnded: false,
  });
  const lastLeftMoveSyncAtMs = useRef(0);
  const lastRightMoveSyncAtMs = useRef(0);

  function programmaticRefFor(pane: PaneId) {
    return pane === 'left' ? leftProgrammaticRef : rightProgrammaticRef;
  }

  function selectedPaneState(pane: PaneId) {
    return pane === 'left' ? leftPaneState : rightPaneState;
  }

  function setCameraForPane(pane: PaneId, camera: MapCameraPosition) {
    if (pane === 'left') setLeftCameraPosition(camera);
    else setRightCameraPosition(camera);
  }

  function syncFromPane(source: PaneId, position: MapCameraPosition, fromMove: boolean) {
    const now = performance.now();

    if (pairedFlyToRef.current.active) {
      if (now > pairedFlyToRef.current.untilMs) {
        clearPairedFlyTo(pairedFlyToRef);
        clearProgrammaticMove(leftProgrammaticRef);
        clearProgrammaticMove(rightProgrammaticRef);
      } else {
        setCameraForPane(source, position);
        if (!fromMove) {
          if (source === 'left') pairedFlyToRef.current.leftEnded = true;
          else pairedFlyToRef.current.rightEnded = true;

          if (pairedFlyToRef.current.leftEnded && pairedFlyToRef.current.rightEnded) {
            clearPairedFlyTo(pairedFlyToRef);
            clearProgrammaticMove(leftProgrammaticRef);
            clearProgrammaticMove(rightProgrammaticRef);
          }
        }
        return;
      }
    }

    const sourceRef = programmaticRefFor(source);

    if (sourceRef.current.key != null) {
      if (now > sourceRef.current.untilMs) {
        clearProgrammaticMove(sourceRef);
      } else {
        const age = now - sourceRef.current.sinceMs;
        if (age <= PROGRAMMATIC_GRACE_MS || isProgrammaticMove(sourceRef, position, now)) {
          setCameraForPane(source, position);
          return;
        }
        clearProgrammaticMove(sourceRef);
      }
    }

    const lastSyncRef = source === 'left' ? lastLeftMoveSyncAtMs : lastRightMoveSyncAtMs;
    if (fromMove && now - lastSyncRef.current < MOVE_SYNC_INTERVAL_MS) return;
    lastSyncRef.current = now;

    const target: PaneId = source === 'left' ? 'right' : 'left';
    const targetRef = programmaticRefFor(target);
    setCameraForPane(source, position);
    setCameraForPane(target, position);
    markProgrammaticMove(targetRef, position, now);
    selectedPaneState(target).mapState.moveCameraTo(position, 0);
  }

  function flyToLocation(location: CameraLocationInfo) {
    const now = performance.now();
    const position = createMapCameraPosition({
      position: location.center,
      zoom: location.zoom,
      bearing: 0,
      tilt: 0,
    });

    pairedFlyToRef.current = {
      active: true,
      untilMs: now + FLY_TO_DURATION_MS + PROGRAMMATIC_TTL_MS,
      leftEnded: false,
      rightEnded: false,
    };

    leftPaneState.mapState.moveCameraTo(position, FLY_TO_DURATION_MS);
    rightPaneState.mapState.moveCameraTo(position, FLY_TO_DURATION_MS);
    setLeftCameraPosition(position);
    setRightCameraPosition(position);
    markProgrammaticMove(leftProgrammaticRef, position, now, FLY_TO_DURATION_MS + PROGRAMMATIC_TTL_MS);
    markProgrammaticMove(rightProgrammaticRef, position, now, FLY_TO_DURATION_MS + PROGRAMMATIC_TTL_MS);
  }

  return (
    <div className="camera-sync-page">
      <div className="camera-sync-toolbar">
        <h2>Camera Sync</h2>
        <div className="camera-sync-location-list">
          {locations.map(location => (
            <button key={location.name} type="button" onClick={() => flyToLocation(location)}>
              {location.name}
            </button>
          ))}
        </div>
      </div>

      <div className="camera-sync-grid">
        <CameraSyncMapPane
          label={`Source Camera (${providerLabel(leftProvider)})`}
          paneState={leftPaneState}
          selectedProvider={leftProvider}
          onProviderChange={setLeftProvider}
          cameraPosition={leftCameraPosition}
          onCameraMove={position => syncFromPane('left', position, true)}
          onCameraMoveEnd={position => syncFromPane('left', position, false)}
          boundsPolylines={boundsPolylines}
          referenceRectangles={rectangles}
        />
        <CameraSyncMapPane
          label={`Synced Camera (${providerLabel(rightProvider)})`}
          paneState={rightPaneState}
          selectedProvider={rightProvider}
          onProviderChange={setRightProvider}
          cameraPosition={rightCameraPosition}
          onCameraMove={position => syncFromPane('right', position, true)}
          onCameraMoveEnd={position => syncFromPane('right', position, false)}
          boundsPolylines={boundsPolylines}
          referenceRectangles={rectangles}
        />
      </div>
    </div>
  );
}
