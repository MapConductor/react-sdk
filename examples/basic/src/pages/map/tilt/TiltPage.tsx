import { useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  MarkerAnimation,
  computeOffset,
  createGeoPoint,
  createMarkerState,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

// Zoomed out enough that all 5 concentric marker rings (out to 15 km) fit in view.
const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 11 };

// A marker at the map center, plus 5 concentric rings at 3 km intervals
// (3–15 km), each with 8 markers spaced every 45°. Total: 1 + 5 × 8 = 41.
const RING_COUNT = 5;
const RING_SPACING_METERS = 3000;
const MARKERS_PER_RING = 8;
const CENTER = createGeoPoint({ latitude: INIT_CAMERA.lat, longitude: INIT_CAMERA.lng });

// Center marker + one distinct colour per ring (rings 1–5).
const CENTER_COLOR = '#111827';
const RING_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'];
const BOUNCE_RESET_MS = 2100;

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
      <Markers states={TILT_MARKERS} />
      {mapViewState && <TiltContent mapViewState={mapViewState} />}
    </MapViewContainer>
  );
}
