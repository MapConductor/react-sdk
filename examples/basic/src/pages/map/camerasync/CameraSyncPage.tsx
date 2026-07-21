import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createMapCameraPosition,
  type MapCameraPosition,
} from '@mapconductor/js-sdk-core';
import '@mapconductor/react-for-openlayers/style.css';
import '@mapconductor/react-for-mapbox/style.css';
import '@mapconductor/react-for-leaflet/style.css';
import { CameraSyncMapPane } from './CameraSyncMapPane';
import {
  cameraSyncProviderById,
  cameraSyncProviders,
} from './cameraSyncProviderRegistry';
import { useCameraSyncProviderStates } from './cameraSyncProviders';
import {
  FLY_TO_DURATION_MS,
  INITIAL_CAMERA,
  MOVE_SYNC_INTERVAL_MS,
  PROGRAMMATIC_GRACE_MS,
  PROGRAMMATIC_TTL_MS,
  boundsPolyline,
  defaultLocations,
  referenceRectangles,
} from './cameraSyncData';
import {
  clearPairedFlyTo,
  clearProgrammaticMove,
  isProgrammaticMove,
  markProgrammaticMove,
} from './cameraSyncLogic';
import type {
  CameraLocationInfo,
  PairedFlyToState,
  PaneId,
  PaneProvider,
  ProgrammaticMoveState,
} from './types';

export function CameraSyncPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const locations = useMemo(defaultLocations, []);
  const boundsPolylines = useMemo(() => locations.map(boundsPolyline), [locations]);
  const rectangles = useMemo(() => referenceRectangles(locations), [locations]);
  const leftStates = useCameraSyncProviderStates('left');
  const rightStates = useCameraSyncProviderStates('right');

  const [leftProvider, setLeftProvider] = useState<PaneProvider>('maplibre');
  const [rightProvider, setRightProvider] = useState<PaneProvider>('leaflet');
  const [leftCameraPosition, setLeftCameraPosition] = useState(INITIAL_CAMERA);
  const [rightCameraPosition, setRightCameraPosition] = useState(INITIAL_CAMERA);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === pageRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement === pageRef.current) {
      await document.exitFullscreen();
      return;
    }
    await pageRef.current?.requestFullscreen();
  }

  const leftPaneState = leftStates[leftProvider];
  const rightPaneState = rightStates[rightProvider];
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
    <div ref={pageRef} className="camera-sync-page">
      <div className="camera-sync-toolbar">
        <div className="camera-sync-toolbar-heading">
          <h2>Camera Sync</h2>
          <button
            type="button"
            className="camera-sync-fullscreen-button"
            aria-pressed={isFullscreen}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? 'フルスクリーンを終了' : 'フルスクリーン'}
          </button>
        </div>
        <label className="camera-sync-overlay-toggle">
          <span>地図だけ表示</span>
          <input
            type="checkbox"
            checked={!showOverlays}
            onChange={event => setShowOverlays(!event.target.checked)}
          />
          <span className="camera-sync-switch" aria-hidden="true">
            <span className="camera-sync-switch-thumb" />
          </span>
        </label>
        <div className="camera-sync-location-list">
          {locations.map(location => (
            <button key={location.name} type="button" onClick={() => flyToLocation(location)}>
              {location.name}
            </button>
          ))}
        </div>
        <select
          className="camera-sync-location-select"
          defaultValue=""
          aria-label="場所を選択"
          onChange={event => {
            const location = locations.find(item => item.name === event.target.value);
            if (location) flyToLocation(location);
          }}
        >
          <option value="">場所を選択</option>
          {locations.map(location => (
            <option key={location.name} value={location.name}>{location.name}</option>
          ))}
        </select>
      </div>

      <div className="camera-sync-grid">
        <CameraSyncMapPane
          label={`Source Camera (${cameraSyncProviderById[leftProvider].label})`}
          paneState={leftPaneState}
          provider={cameraSyncProviderById[leftProvider]}
          providerOptions={cameraSyncProviders}
          selectedProvider={leftProvider}
          onProviderChange={setLeftProvider}
          cameraPosition={leftCameraPosition}
          onCameraMove={position => syncFromPane('left', position, true)}
          onCameraMoveEnd={position => syncFromPane('left', position, false)}
          boundsPolylines={boundsPolylines}
          referenceRectangles={rectangles}
          showOverlays={showOverlays}
        />
        <CameraSyncMapPane
          label={`Synced Camera (${cameraSyncProviderById[rightProvider].label})`}
          paneState={rightPaneState}
          provider={cameraSyncProviderById[rightProvider]}
          providerOptions={cameraSyncProviders}
          selectedProvider={rightProvider}
          onProviderChange={setRightProvider}
          cameraPosition={rightCameraPosition}
          onCameraMove={position => syncFromPane('right', position, true)}
          onCameraMoveEnd={position => syncFromPane('right', position, false)}
          boundsPolylines={boundsPolylines}
          referenceRectangles={rectangles}
          showOverlays={showOverlays}
        />
      </div>
    </div>
  );
}
