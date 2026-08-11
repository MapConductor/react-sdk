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

function TiltContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const { t } = useSampleI18n();
  const [tilt, setTilt] = useState(0);
  const cameraPositionRef = useRef(mapViewState.cameraPosition);

  return (
    <ControlPanel title={t('Tilt', '傾き')}>
      <SliderControl
        label={t('Tilt', '傾き')}
        value={tilt}
        min={-60}
        max={60}
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
