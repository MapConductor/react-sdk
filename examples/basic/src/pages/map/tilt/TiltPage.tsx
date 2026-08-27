import { useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  MarkerAnimation,
  computeOffset,
  createCircleState,
  createGeoPoint,
  createMarkerState,
  type CircleState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Circle, Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

/**
 * ほとんどのプロバイダは 60 度で頭打ちになるが、ArcGIS だけは 90 度近くまで実際に傾く。
 * その範囲を触れるようにするためスライダーは ±89 にしてある
 * （android-sdk の TiltMapPage.kt / ios-sdk の TiltMapPage.swift と同じ範囲）。
 */
const TILT_LIMIT = 89;

// Keep these in step with the Android and iOS tilt samples
// (`TiltMapPageViewModel.kt` / `TiltMapPageViewModel.swift`). The three pages are
// meant to be compared side by side, so the camera and the marker layout must match.
//
// The Eiffel Tower, looking west (bearing 270). A non-zero bearing is deliberate:
// it is what exposed a driver bug where marker anchors were rotated with the map
// instead of the screen, and that only shows up when the map is not north-up.
const INIT_CAMERA = { lat: 48.858140690309604, lng: 2.2945027576710344, zoom: 17, bearing: 270 };

// A marker at the map center, plus 5 concentric rings at 60 m intervals
// (60–300 m), each with 8 markers spaced every 45°. Total: 1 + 5 × 8 = 41.
//
// 60 m suits zoom 17: the outermost ring stays on screen, which is the point of
// the page (seeing how near and far markers differ once the camera tilts).
const RING_COUNT = 5;
const RING_SPACING_METERS = 60;
const MARKERS_PER_RING = 8;
const CENTER = createGeoPoint({ latitude: INIT_CAMERA.lat, longitude: INIT_CAMERA.lng });

// Center marker + one distinct colour per ring (rings 1–5).
const CENTER_COLOR = '#111827';
const RING_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'];
const BOUNCE_RESET_MS = 2100;

// A small circle under each marker. Circles are drawn on the ground, markers are
// drawn at a fixed screen size, so if a pin tip drifts off its circle while
// tilting or rotating, the fault is on the marker side. This is how the
// Open Mobile Maps anchor bug was pinned down; keep it as a standing check.
const ANCHOR_RADIUS_METERS = 2.5;
const ANCHOR_FILL_COLOR = '#ff00ff';
const ANCHOR_STROKE_COLOR = '#000000';

// Bounce the marker on click. Setting `animation` runs `animate()` under the
// hood; reset it to null after the bounce so a later click can bounce again.
function bounceOnClick(state: MarkerState): void {
  state.animation = MarkerAnimation.Bounce;
  window.setTimeout(() => { state.animation = null; }, BOUNCE_RESET_MS);
}

const TILT_MARKERS: MarkerState[] = [
  createMarkerState({
    id: 'tilt-center',
    position: CENTER,
    icon: new ColorDefaultIcon({ fillColor: CENTER_COLOR }),
    onClick: bounceOnClick,
  }),
  ...Array.from({ length: RING_COUNT }, (_unused, ringIndex) => ringIndex + 1).flatMap(ring =>
    Array.from({ length: MARKERS_PER_RING }, (_unused, step) => {
      const heading = step * (360 / MARKERS_PER_RING);
      return createMarkerState({
        id: `tilt-ring${ring}-${heading}`,
        position: computeOffset({ origin: CENTER, distance: ring * RING_SPACING_METERS, heading }),
        icon: new ColorDefaultIcon({ fillColor: RING_COLORS[ring - 1] }),
        onClick: bounceOnClick,
      });
    }),
  ),
];

const ANCHOR_CIRCLES: CircleState[] = TILT_MARKERS.map(marker =>
  createCircleState({
    id: `anchor-${marker.id}`,
    center: marker.position,
    radiusMeters: ANCHOR_RADIUS_METERS,
    geodesic: true,
    fillColor: ANCHOR_FILL_COLOR,
    strokeColor: ANCHOR_STROKE_COLOR,
    strokeWidth: 1,
    clickable: false,
  }),
);

// android の TiltMapPage.kt / ios の TiltMapPage.swift にある TiltCameraDiagram と
// 同じ式・同じ配色。スライダーに追従してカメラ・注視点・視線が動く。
function TiltCameraDiagram({ tilt }: { tilt: number }) {
  const width = 280;
  const height = 120;
  const groundY = height * 0.78;
  const originX = width * 0.5;
  const baseCameraY = height * 0.22;
  const tiltAbs = Math.min(Math.abs(tilt), 90);
  const tiltRad = (tiltAbs * Math.PI) / 180;
  const altitudePx = groundY - baseCameraY;
  const targetDistance = Math.min(altitudePx * Math.tan(tiltRad), width * 0.44);
  const targetX = tilt < 0 ? originX - targetDistance : originX;
  const targetY = groundY;
  const cameraX = tilt > 0 ? originX + targetDistance : originX;
  const cameraY = baseCameraY;
  const sightEndX = tilt === 0 ? cameraX : targetX;
  const sightEndY = targetY;
  const cameraBody = [
    [cameraX - 12, cameraY - 8],
    [cameraX + 14, cameraY - 4],
    [cameraX + 10, cameraY + 10],
    [cameraX - 12, cameraY + 8],
  ].map(p => p.join(',')).join(' ');

  return (
    <svg className="tilt-camera-diagram" width="100%" viewBox={`0 0 ${width} ${height}`} style={{ marginBottom: 4 }}>
      <line x1={width * 0.08} y1={groundY} x2={width * 0.94} y2={groundY} stroke="#E4E0EC" strokeWidth={3} strokeLinecap="round" />
      <line x1={cameraX} y1={cameraY} x2={cameraX} y2={groundY} stroke="#8E879A" strokeWidth={2} />
      <circle cx={cameraX} cy={cameraY} r={8} fill="#5DA7FF" />
      <circle cx={targetX} cy={targetY} r={7} fill="#FF6259" />
      <line x1={cameraX} y1={cameraY} x2={sightEndX} y2={sightEndY} stroke="#FFC857" strokeWidth={4} strokeLinecap="round" />
      <polygon points={cameraBody} fill="#2F2A38" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
      <circle cx={originX} cy={groundY} r={3.5} fill="#8E879A" />
      <line
        x1={Math.min(cameraX, targetX)} y1={groundY + 12}
        x2={Math.max(cameraX, targetX)} y2={groundY + 12}
        stroke="#B8AFCA" strokeWidth={2} strokeLinecap="round"
      />
    </svg>
  );
}

function TiltContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const { t } = useSampleI18n();
  const [tilt, setTilt] = useState(0);
  const cameraPositionRef = useRef(mapViewState.cameraPosition);

  return (
    <ControlPanel title={t({ en: 'Tilt', ja: '傾き', 'es-419': 'Inclinación', de: 'Neigung', th: 'การเอียง', hi: 'झुकाव' })}>
      <TiltCameraDiagram tilt={tilt} />
      <SliderControl
        label={t({ en: 'Tilt', ja: '傾き', 'es-419': 'Inclinación', de: 'Neigung', th: 'การเอียง', hi: 'झुकाव' })}
        value={tilt}
        min={-TILT_LIMIT}
        max={TILT_LIMIT}
        step={1}
        format={value => `${value.toFixed(0)}°`}
        onChange={value => {
          setTilt(value);
          const nextCameraPosition = cameraPositionRef.current.copy({ tilt: value });
          cameraPositionRef.current = nextCameraPosition;
          mapViewState.moveCameraTo(nextCameraPosition, 400);
        }}
      />
    </ControlPanel>
  );
}

export function TiltPage() {
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onStateReady={setMapViewState}>
      {ANCHOR_CIRCLES.map(circle => (
        <Circle key={circle.id} state={circle} />
      ))}
      <Markers states={TILT_MARKERS} />
      {mapViewState && <TiltContent mapViewState={mapViewState} />}
    </MapViewContainer>
  );
}
