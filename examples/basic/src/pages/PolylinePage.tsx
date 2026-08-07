import { useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createMarkerState,
  createPolylineState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../components/ControlPanel';
import { MapViewContainer } from '../MapViewContainer';
import { useSampleI18n } from '../samples/i18n';

const INIT_CAMERA = { lat: 21.382314, lng: -157.933097, zoom: 15 };

// Colors mirror the Android polyline/basic sample (Color.Green / Color.Yellow /
// Color.Black / Color.Red).
const GREEN = '#00ff00';
const YELLOW = '#ffff00';
const BLACK = '#000000';
const RED = '#ff0000';

// The Android sample lays out a closed loop around Honolulu (last point equals
// the first).
const INITIAL_POINTS: GeoPoint[] = [
  createGeoPoint({ latitude: 21.382314, longitude: -157.933097 }), // Honolulu center
  createGeoPoint({ latitude: 21.385314, longitude: -157.930097 }), // Northeast
  createGeoPoint({ latitude: 21.387314, longitude: -157.935097 }), // Northwest
  createGeoPoint({ latitude: 21.380314, longitude: -157.937097 }), // Southwest
  createGeoPoint({ latitude: 21.378314, longitude: -157.930097 }), // Southeast
  createGeoPoint({ latitude: 21.382314, longitude: -157.933097 }), // Back to center
];

export function PolylinePage() {
  const { t } = useSampleI18n();
  const [points, setPoints] = useState<GeoPoint[]>(INITIAL_POINTS);
  const setPointsRef = useRef(setPoints);
  setPointsRef.current = setPoints;

  const polylineState = useMemo(
    () =>
      createPolylineState({
        id: 'example_polyline',
        points,
        strokeColor: RED,
        strokeWidth: 4,
        geodesic: true,
      }),
    [points],
  );

  const wayPointMarkers = useMemo(
    () =>
      points.map((point, index) => {
        const isEndpoint = index === 0 || index === points.length - 1;
        const fillColor = isEndpoint ? GREEN : YELLOW;
        const label = index === 0 ? 'S' : index === points.length - 1 ? 'E' : String(index);
        const onDrag = (state: MarkerState) => {
          setPointsRef.current(prev => {
            const next = [...prev];
            next[index] = state.position;
            return next;
          });
        };
        return createMarkerState({
          id: `waypoint_${index}`,
          position: point,
          icon: new ColorDefaultIcon({ fillColor, strokeColor: BLACK, label }),
          draggable: true,
          clickable: false,
          onDragStart: onDrag,
          onDrag,
          onDragEnd: onDrag,
        });
      }),
    [points],
  );

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Polyline state={polylineState} />
      <Markers states={wayPointMarkers} />
      <ControlPanel title={t('Description', '説明')}>
        <p className="control-panel-note">
          {t(
            'Drag the waypoint markers to reshape the polyline.',
            'ウェイポイントのマーカーをドラッグすると、ポリラインの形を変更できます。',
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
