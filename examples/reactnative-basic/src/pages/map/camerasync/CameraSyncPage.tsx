import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  GeoPoint,
  MapCameraPosition,
  createPolygonState,
  createPolylineState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type PolygonState,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import { Polygon, Polyline } from '@mapconductor/js-sdk-react/native';
import { MapLibreDesign } from '@mapconductor/reactnative-for-maplibre';
import { MapViewContainer } from '../../MapViewContainer';
import { useMapStateRef } from '../../../providers/useMapStateRef';
import { MAP_PROVIDERS, PROVIDER_LABELS } from '../../../providers/providerCatalog';
import type { MapProvider } from '../../../providers/types';

type PaneId = 'left' | 'right';
/** ペインはサンプルが持つ全プロバイダから選べる（web の camera-sync と同じ）。 */
type PaneProvider = MapProvider;

interface CameraLocationInfo {
  name: string;
  /** 範囲を示す赤い矩形の南西・北東。web の camerasync と同じ値。 */
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
  /** MapViewContainer が生成した現在のビューの state。onStateReady で更新される。 */
  stateRef: React.MutableRefObject<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>;
  onStateReady: (state: MapViewStateInterface<MapDesignTypeInterface<unknown>>) => void;
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
      bounds: {
        southWest: GeoPoint.from({ latitude: 35.62, longitude: 139.7, altitude: 0 }),
        northEast: GeoPoint.from({ latitude: 35.74, longitude: 139.84, altitude: 0 }),
      },
      center: GeoPoint.from({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
      zoom: 12,
    },
    {
      name: 'French Southern and Antarctic Lands',
      bounds: {
        southWest: GeoPoint.from({ latitude: -49.5, longitude: 50, altitude: 0 }),
        northEast: GeoPoint.from({ latitude: -37.5, longitude: 77, altitude: 0 }),
      },
      center: GeoPoint.from({ latitude: -43.5, longitude: 63.5, altitude: 0 }),
      zoom: 4,
    },
    {
      name: 'Finland',
      bounds: {
        southWest: GeoPoint.from({ latitude: 59.8, longitude: 19.1, altitude: 0 }),
        northEast: GeoPoint.from({ latitude: 70.1, longitude: 31.6, altitude: 0 }),
      },
      center: GeoPoint.from({ latitude: 64.95, longitude: 25.35, altitude: 0 }),
      zoom: 5,
    },
    {
      name: 'Iceland',
      bounds: {
        southWest: GeoPoint.from({ latitude: 63.3, longitude: -24.5, altitude: 0 }),
        northEast: GeoPoint.from({ latitude: 66.6, longitude: -13.5, altitude: 0 }),
      },
      center: GeoPoint.from({ latitude: 64.95, longitude: -19, altitude: 0 }),
      zoom: 6,
    },
    {
      name: 'Kiribati',
      bounds: {
        southWest: GeoPoint.from({ latitude: -11.5, longitude: -174.5, altitude: 0 }),
        northEast: GeoPoint.from({ latitude: 5, longitude: -147, altitude: 0 }),
      },
      center: GeoPoint.from({ latitude: -3.25, longitude: -160.75, altitude: 0 }),
      zoom: 4.5,
    },
    {
      name: 'Oahu Island',
      bounds: {
        southWest: GeoPoint.from({ latitude: 21.25, longitude: -158.3, altitude: 0 }),
        northEast: GeoPoint.from({ latitude: 21.7, longitude: -157.65, altitude: 0 }),
      },
      center: GeoPoint.from({ latitude: 21.475, longitude: -157.975, altitude: 0 }),
      zoom: 9.5,
    },
  ];
}

/**
 * 行き先の範囲を示す赤い矩形。**測地線で引く**（`geodesic: true`）。
 * 高緯度では画面上で辺が反るので、プロバイダごとの投影の差がここに出る。
 * web の `cameraSyncData.boundsPolyline` と同じ値・同じ色。
 */
function boundsPolyline(location: CameraLocationInfo, index: number): PolylineState {
  const sw = location.bounds.southWest;
  const ne = location.bounds.northEast;
  return createPolylineState({
    id: `camera_sync_bounds_${index}`,
    points: [
      sw,
      GeoPoint.from({ latitude: sw.latitude, longitude: ne.longitude, altitude: 0 }),
      ne,
      GeoPoint.from({ latitude: ne.latitude, longitude: sw.longitude, altitude: 0 }),
      sw,
    ],
    strokeColor: '#dc2626',
    strokeWidth: 3,
    geodesic: true,
  });
}

/**
 * 各行き先の中心に置く 1 度四方の青い参照矩形。**こちらは測地線を使わない**
 * （`geodesic: false`）。赤い矩形と並べることで、同じ 4 点でも測地線の有無で
 * 見え方がどう変わるかが 1 画面で分かる。
 * web の `cameraSyncData.referenceRectangles` と同じ値・同じ色。
 */
function referenceRectangles(locations: CameraLocationInfo[]): PolygonState[] {
  const size = 1;
  return locations.map((location, index) => {
    const lat = location.center.latitude;
    const lng = location.center.longitude;
    return createPolygonState({
      id: `camera_sync_reference_${index}`,
      points: [
        GeoPoint.from({ latitude: lat - size / 2, longitude: lng - size / 2, altitude: 0 }),
        GeoPoint.from({ latitude: lat - size / 2, longitude: lng + size / 2, altitude: 0 }),
        GeoPoint.from({ latitude: lat + size / 2, longitude: lng + size / 2, altitude: 0 }),
        GeoPoint.from({ latitude: lat + size / 2, longitude: lng - size / 2, altitude: 0 }),
        GeoPoint.from({ latitude: lat - size / 2, longitude: lng - size / 2, altitude: 0 }),
      ],
      strokeColor: '#2563eb',
      strokeWidth: 2,
      fillColor: 'rgba(37, 99, 235, 0.1)',
      geodesic: false,
      zIndex: 1,
    });
  });
}

function usePaneState(provider: PaneProvider): PaneState {
  const { stateRef, onStateReady } = useMapStateRef();
  return { provider, stateRef, onStateReady };
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
  paneId,
  paneState,
  cameraPosition,
  boundsPolylines,
  referenceRectangles,
  onCameraMove,
  onCameraMoveEnd,
}: {
  paneId: PaneId;
  paneState: PaneState;
  cameraPosition: MapCameraPosition;
  boundsPolylines: PolylineState[];
  referenceRectangles: PolygonState[];
  onCameraMove: (camera: MapCameraPosition) => void;
  onCameraMoveEnd: (camera: MapCameraPosition) => void;
}) {
  return (
    <MapViewContainer
      provider={paneState.provider}
      // プロバイダを変えるとビューは作り直しになる。`cameraPosition` は
      // 生成時にしか読まれない（`useMapLibreViewState` などが `useState` の
      // 初期値として持つだけ）ので、ここに今のカメラを渡しておくと
      // 切り替え後も同じ場所から始まる。INITIAL_CAMERA だと東京へ戻ってしまう。
      cameraPosition={cameraPosition}
      mapId={`camera-sync-${paneId}`}
      style={styles.map}
      designTypes={{ maplibre: MapLibreDesign.OpenMapTiles }}
      onStateReady={paneState.onStateReady}
      onCameraMove={onCameraMove}
      onCameraMoveEnd={onCameraMoveEnd}
    >
      {boundsPolylines.map((polyline) => (
        <Polyline key={polyline.id} state={polyline} />
      ))}
      {referenceRectangles.map((polygon) => (
        <Polygon key={polygon.id} state={polygon} />
      ))}
    </MapViewContainer>
  );
}

/**
 * ペインごとの地図プロバイダ選択。**アプリのヘッダーと同じ作り**
 * （ボタン＋一覧）にしてある。`@react-native-picker/picker` は iOS では
 * ホイールになり、地図に重ねる小さな枠に収まらない。
 */
function ProviderDropdown({
  label,
  selectedProvider,
  onProviderChange,
}: {
  label: string;
  selectedProvider: PaneProvider;
  onProviderChange: (provider: PaneProvider) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectProvider = (provider: PaneProvider) => {
    onProviderChange(provider);
    setIsMenuOpen(false);
  };

  return (
    <>
      {isMenuOpen ? (
        // 開いている間だけペイン全体を透明な層で覆い、外側タップで閉じる。
        // 地図より手前に無いと、閉じる操作がそのまま地図のパンになる。
        <Pressable style={styles.providerScrim} onPress={() => setIsMenuOpen(false)} />
      ) : null}

      <View style={styles.providerCard}>
        <Text style={styles.providerLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.providerControl}
          activeOpacity={0.75}
          onPress={() => setIsMenuOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={`${label} map provider`}
        >
          <Text style={styles.providerControlText} numberOfLines={1}>
            {PROVIDER_LABELS[selectedProvider]}
          </Text>
          <Text style={styles.providerChevron}>v</Text>
        </TouchableOpacity>

        {isMenuOpen ? (
          <ScrollView style={styles.providerMenu} contentContainerStyle={styles.providerMenuContent}>
            {MAP_PROVIDERS.map((provider) => {
              const isActive = provider === selectedProvider;
              return (
                <TouchableOpacity
                  key={provider}
                  style={[styles.providerMenuItem, isActive && styles.providerMenuItemActive]}
                  activeOpacity={0.75}
                  onPress={() => selectProvider(provider)}
                  accessibilityRole="button"
                  // 左右のペインに同じ名前が並ぶので、ペイン名を前置して
                  // 実機の UI テストからどちらの一覧か区別できるようにする。
                  accessibilityLabel={`${label} ${PROVIDER_LABELS[provider]}`}
                >
                  <Text
                    style={[styles.providerMenuItemText, isActive && styles.providerMenuItemTextActive]}
                    numberOfLines={1}
                  >
                    {PROVIDER_LABELS[provider]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}

function CameraSyncMapPane({
  paneId,
  label,
  paneState,
  selectedProvider,
  onProviderChange,
  cameraPosition,
  boundsPolylines,
  referenceRectangles,
  onCameraMove,
  onCameraMoveEnd,
}: {
  paneId: PaneId;
  label: string;
  paneState: PaneState;
  selectedProvider: PaneProvider;
  onProviderChange: (provider: PaneProvider) => void;
  cameraPosition: MapCameraPosition;
  boundsPolylines: PolylineState[];
  referenceRectangles: PolygonState[];
  onCameraMove: (position: MapCameraPosition) => void;
  onCameraMoveEnd: (position: MapCameraPosition) => void;
}) {
  return (
    <View style={styles.pane}>
      <CameraSyncMapView
        paneId={paneId}
        paneState={paneState}
        cameraPosition={cameraPosition}
        boundsPolylines={boundsPolylines}
        referenceRectangles={referenceRectangles}
        onCameraMove={onCameraMove}
        onCameraMoveEnd={onCameraMoveEnd}
      />

      <CameraInfoCard label={PROVIDER_LABELS[selectedProvider]} position={cameraPosition} />

      {/* 一覧が伸びたとき情報カードに隠れないよう、ペインの最後に置く。 */}
      <ProviderDropdown
        label={label}
        selectedProvider={selectedProvider}
        onProviderChange={onProviderChange}
      />
    </View>
  );
}

export function CameraSyncPage() {
  const { width, height } = useWindowDimensions();
  const isStacked = height > width;
  const locations = useMemo(defaultLocations, []);
  // 左右のペインで同じ state を共有する（web の camerasync と同じ）。
  // オーバーレイは地図ごとに id で登録されるので、1 組を両方へ渡せる。
  const boundsPolylines = useMemo(() => locations.map(boundsPolyline), [locations]);
  const rectangles = useMemo(() => referenceRectangles(locations), [locations]);

  const [leftProvider, setLeftProvider] = useState<PaneProvider>('maplibre');
  const [rightProvider, setRightProvider] = useState<PaneProvider>('google-maps');
  const [leftCameraPosition, setLeftCameraPosition] = useState(INITIAL_CAMERA);
  const [rightCameraPosition, setRightCameraPosition] = useState(INITIAL_CAMERA);

  const leftPaneState = usePaneState(leftProvider);
  const rightPaneState = usePaneState(rightProvider);

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
    selectedPaneState(target).stateRef.current?.moveCameraTo(position, 0);
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

    leftPaneState.stateRef.current?.moveCameraTo(position, FLY_TO_DURATION_MS);
    rightPaneState.stateRef.current?.moveCameraTo(position, FLY_TO_DURATION_MS);
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
              // 実機の UI テストが行き先名で叩けるようにする。付けないと RN の
              // この行は要素ツリーで名前の無い Other にしかならない
              // （サイドメニューの `SAMPLE_PAGES` と同じ理由）。
              accessibilityRole="button"
              accessibilityLabel={location.name}
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
          paneId="left"
          label="Left"
          paneState={leftPaneState}
          selectedProvider={leftProvider}
          onProviderChange={setLeftProvider}
          cameraPosition={leftCameraPosition}
          boundsPolylines={boundsPolylines}
          referenceRectangles={rectangles}
          onCameraMove={(position) => syncFromPane('left', position, true)}
          onCameraMoveEnd={(position) => syncFromPane('left', position, false)}
        />
        <CameraSyncMapPane
          paneId="right"
          label="Right"
          paneState={rightPaneState}
          selectedProvider={rightProvider}
          onProviderChange={setRightProvider}
          cameraPosition={rightCameraPosition}
          boundsPolylines={boundsPolylines}
          referenceRectangles={rectangles}
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
  providerScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  providerCard: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 200,
    maxWidth: '92%',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  providerLabel: {
    marginBottom: 4,
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '700',
  },
  providerControl: {
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerControlText: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  providerChevron: {
    marginLeft: 8,
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  providerMenu: {
    // 縦並び（縦向き）のときペインは画面の半分しかない。伸ばしきらずに
    // 中でスクロールさせる。
    maxHeight: 200,
    marginTop: 6,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  providerMenuContent: {
    paddingVertical: 4,
  },
  providerMenuItem: {
    minHeight: 36,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  providerMenuItemActive: {
    backgroundColor: '#eff6ff',
  },
  providerMenuItemText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  providerMenuItemTextActive: {
    color: '#1d4ed8',
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
