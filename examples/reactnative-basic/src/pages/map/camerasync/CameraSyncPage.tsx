import React, { useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  GeoPoint,
  MapCameraPosition,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
} from '@mapconductor/js-sdk-core';
import {
  GoogleMapDesign,
  useGoogleMapViewState,
  type GoogleMapViewState,
} from '@mapconductor/react-for-googlemaps';
import {
  MapLibreDesign,
  useMapLibreViewState,
  type MapLibreViewState,
} from '@mapconductor/react-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';

type PaneId = 'left' | 'right';
type PaneProvider = 'maplibre' | 'google-maps';

interface CameraLocationInfo {
  name: string;
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

const INITIAL_CAMERA = MapCameraPosition.from({
  position: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

const PROGRAMMATIC_TTL_MS = 1200;
const PROGRAMMATIC_GRACE_MS = 250;
const MOVE_SYNC_INTERVAL_MS = 33;
const FLY_TO_DURATION_MS = 1000;

function nowMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

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
  currentMs: number,
  ttlMs = PROGRAMMATIC_TTL_MS,
) {
  ref.current = {
    key: cameraKey(target),
    target,
    sinceMs: currentMs,
    untilMs: currentMs + ttlMs,
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
  currentMs: number,
): boolean {
  const state = ref.current;
  if (state.key == null || currentMs > state.untilMs) return false;
  if (cameraKey(camera) === state.key) return true;
  return state.target ? isCloseToTarget(camera, state.target) : false;
}

function defaultLocations(): CameraLocationInfo[] {
  return [
    {
      name: 'Tokyo',
      center: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
      zoom: 12,
    },
    {
      name: 'French Southern and Antarctic Lands',
      center: GeoPoint.from({ latitude: -43.5, longitude: 63.5, altitude: 0 }),
      zoom: 4,
    },
    {
      name: 'Finland',
      center: GeoPoint.from({ latitude: 64.95, longitude: 25.35, altitude: 0 }),
      zoom: 5,
    },
    {
      name: 'Iceland',
      center: GeoPoint.from({ latitude: 64.95, longitude: -19, altitude: 0 }),
      zoom: 6,
    },
    {
      name: 'Kiribati',
      center: GeoPoint.from({ latitude: -3.25, longitude: -160.75, altitude: 0 }),
      zoom: 4.5,
    },
    {
      name: 'Oahu Island',
      center: GeoPoint.from({ latitude: 21.475, longitude: -157.975, altitude: 0 }),
      zoom: 9.5,
    },
  ];
}

function usePaneState(
  provider: PaneProvider,
  mapLibreState: MapLibreViewState,
  googleState: GoogleMapViewState,
): PaneState {
  if (provider === 'google-maps') {
    return {
      provider,
      mapState: googleState as MapViewStateInterface<MapDesignTypeInterface<unknown>>,
    };
  }
  return {
    provider,
    mapState: mapLibreState as MapViewStateInterface<MapDesignTypeInterface<unknown>>,
  };
}

function providerLabel(provider: PaneProvider): string {
  return provider === 'google-maps' ? 'Google Maps' : 'MapLibre';
}

function CameraInfoCard({
  label,
  position,
}: {
  label: string;
  position: MapCameraPosition;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{label}</Text>
      <Text style={styles.infoText}>Lat: {position.position.latitude.toFixed(5)}</Text>
      <Text style={styles.infoText}>Lng: {position.position.longitude.toFixed(5)}</Text>
      <Text style={styles.infoText}>Zoom: {position.zoom.toFixed(2)}</Text>
      <Text style={styles.infoText}>Tilt: {position.tilt.toFixed(1)}deg</Text>
      <Text style={styles.infoText}>Bearing: {position.bearing.toFixed(1)}deg</Text>
    </View>
  );
}

function CameraSyncMapView({
  paneState,
  onCameraMove,
  onCameraMoveEnd,
}: {
  paneState: PaneState;
  onCameraMove: (camera: MapCameraPosition) => void;
  onCameraMoveEnd: (camera: MapCameraPosition) => void;
}) {
  return (
    <MapViewContainer
      state={paneState.mapState}
      style={styles.map}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    />
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
}: {
  label: string;
  paneState: PaneState;
  selectedProvider: PaneProvider;
  onProviderChange: (provider: PaneProvider) => void;
  cameraPosition: MapCameraPosition;
  onCameraMove: (position: MapCameraPosition) => void;
  onCameraMoveEnd: (position: MapCameraPosition) => void;
}) {
  return (
    <View style={styles.pane}>
      <CameraSyncMapView
        paneState={paneState}
        onCameraMove={onCameraMove}
        onCameraMoveEnd={onCameraMoveEnd}
      />

      <View style={styles.providerCard}>
        <Text style={styles.providerLabel}>{label}</Text>
        <Picker<PaneProvider>
          selectedValue={selectedProvider}
          onValueChange={(value) => onProviderChange(value)}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="MapLibre" value="maplibre" />
          <Picker.Item label="Google Maps" value="google-maps" />
        </Picker>
      </View>

      <CameraInfoCard label={providerLabel(selectedProvider)} position={cameraPosition} />
    </View>
  );
}

export function CameraSyncPage() {
  const { width, height } = useWindowDimensions();
  const isStacked = height > width;
  const locations = useMemo(defaultLocations, []);

  const leftMapLibreState = useMapLibreViewState({
    id: 'camera-sync-left-maplibre',
    mapDesignType: MapLibreDesign.OpenMapTiles,
    cameraPosition: INITIAL_CAMERA,
  });
  const rightMapLibreState = useMapLibreViewState({
    id: 'camera-sync-right-maplibre',
    mapDesignType: MapLibreDesign.OpenMapTiles,
    cameraPosition: INITIAL_CAMERA,
  });
  const leftGoogleState = useGoogleMapViewState({
    id: 'camera-sync-left-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });
  const rightGoogleState = useGoogleMapViewState({
    id: 'camera-sync-right-google',
    mapDesignType: GoogleMapDesign.Normal,
    cameraPosition: INITIAL_CAMERA,
  });

  const [leftProvider, setLeftProvider] = useState<PaneProvider>('maplibre');
  const [rightProvider, setRightProvider] = useState<PaneProvider>('google-maps');
  const [leftCameraPosition, setLeftCameraPosition] = useState(INITIAL_CAMERA);
  const [rightCameraPosition, setRightCameraPosition] = useState(INITIAL_CAMERA);

  const leftPaneState = usePaneState(leftProvider, leftMapLibreState, leftGoogleState);
  const rightPaneState = usePaneState(rightProvider, rightMapLibreState, rightGoogleState);

  const leftProgrammaticRef = useRef<ProgrammaticMoveState>({
    key: null,
    target: null,
    sinceMs: 0,
    untilMs: 0,
  });
  const rightProgrammaticRef = useRef<ProgrammaticMoveState>({
    key: null,
    target: null,
    sinceMs: 0,
    untilMs: 0,
  });
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
    const currentMs = nowMs();

    if (pairedFlyToRef.current.active) {
      if (currentMs > pairedFlyToRef.current.untilMs) {
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
      if (currentMs > sourceRef.current.untilMs) {
        clearProgrammaticMove(sourceRef);
      } else {
        const age = currentMs - sourceRef.current.sinceMs;
        if (
          age <= PROGRAMMATIC_GRACE_MS ||
          isProgrammaticMove(sourceRef, position, currentMs)
        ) {
          setCameraForPane(source, position);
          return;
        }
        clearProgrammaticMove(sourceRef);
      }
    }

    const lastSyncRef = source === 'left' ? lastLeftMoveSyncAtMs : lastRightMoveSyncAtMs;
    if (fromMove && currentMs - lastSyncRef.current < MOVE_SYNC_INTERVAL_MS) return;
    lastSyncRef.current = currentMs;

    const target: PaneId = source === 'left' ? 'right' : 'left';
    const targetRef = programmaticRefFor(target);
    setCameraForPane(source, position);
    setCameraForPane(target, position);
    markProgrammaticMove(targetRef, position, currentMs);
    selectedPaneState(target).mapState.moveCameraTo(position, 0);
  }

  function flyToLocation(location: CameraLocationInfo) {
    const currentMs = nowMs();
    const position = MapCameraPosition.from({
      position: location.center,
      zoom: location.zoom,
      bearing: 0,
      tilt: 0,
    });

    pairedFlyToRef.current = {
      active: true,
      untilMs: currentMs + FLY_TO_DURATION_MS + PROGRAMMATIC_TTL_MS,
      leftEnded: false,
      rightEnded: false,
    };

    leftPaneState.mapState.moveCameraTo(position, FLY_TO_DURATION_MS);
    rightPaneState.mapState.moveCameraTo(position, FLY_TO_DURATION_MS);
    setLeftCameraPosition(position);
    setRightCameraPosition(position);
    markProgrammaticMove(
      leftProgrammaticRef,
      position,
      currentMs,
      FLY_TO_DURATION_MS + PROGRAMMATIC_TTL_MS,
    );
    markProgrammaticMove(
      rightProgrammaticRef,
      position,
      currentMs,
      FLY_TO_DURATION_MS + PROGRAMMATIC_TTL_MS,
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Camera Sync</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locationList}
        >
          {locations.map((location) => (
            <TouchableOpacity
              key={location.name}
              style={styles.locationButton}
              onPress={() => flyToLocation(location)}
              activeOpacity={0.75}
            >
              <Text style={styles.locationButtonText} numberOfLines={1}>
                {location.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.grid, isStacked ? styles.gridStacked : styles.gridSideBySide]}>
        <CameraSyncMapPane
          label="Left"
          paneState={leftPaneState}
          selectedProvider={leftProvider}
          onProviderChange={setLeftProvider}
          cameraPosition={leftCameraPosition}
          onCameraMove={(position) => syncFromPane('left', position, true)}
          onCameraMoveEnd={(position) => syncFromPane('left', position, false)}
        />
        <CameraSyncMapPane
          label="Right"
          paneState={rightPaneState}
          selectedProvider={rightProvider}
          onProviderChange={setRightProvider}
          cameraPosition={rightCameraPosition}
          onCameraMove={(position) => syncFromPane('right', position, true)}
          onCameraMoveEnd={(position) => syncFromPane('right', position, false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  toolbar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d9dde7',
    gap: 8,
  },
  title: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '700',
  },
  locationList: {
    gap: 8,
    paddingRight: 10,
  },
  locationButton: {
    height: 34,
    maxWidth: 220,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  locationButtonText: {
    color: '#1f2937',
    fontSize: 13,
  },
  grid: {
    flex: 1,
    gap: 1,
    backgroundColor: '#94a3b8',
  },
  gridSideBySide: {
    flexDirection: 'row',
  },
  gridStacked: {
    flexDirection: 'column',
  },
  pane: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    backgroundColor: '#e5e7eb',
  },
  map: {
    flex: 1,
  },
  providerCard: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 220,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    display: 'none',
  },
  providerLabel: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '700',
  },
  picker: {
    height: 38,
    marginHorizontal: -8,
  },
  infoCard: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    minWidth: 150,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  infoTitle: {
    marginBottom: 2,
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  infoText: {
    color: '#1f2937',
    fontSize: 12,
    lineHeight: 16,
  },
});
