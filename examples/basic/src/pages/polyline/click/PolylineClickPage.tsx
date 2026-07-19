import { useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  MarkerAnimation,
  createGeoPoint,
  createMarkerState,
  createPolylineState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 35.548852, lng: 139.784086, zoom: 4 };

// polyline/basic の Android サンプル (Color.Green / Color.Yellow / Color.Black) に合わせた配色。
const ENDPOINT_FILL_COLOR = '#4CAF50';
const MIDDLE_FILL_COLOR = '#FFEB3B';
const WAYPOINT_STROKE_COLOR = '#000000';

export function PolylineClickPage() {
  const { t } = useSampleI18n();
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [clickMarkers, setClickMarkers] = useState<MarkerState[]>([]);
  const [points, setPoints] = useState<GeoPoint[]>(() => [
    createGeoPoint({ latitude: 35.548852, longitude: 139.784086 }), // HND
    createGeoPoint({ latitude: 37.615223, longitude: -122.389979 }), // SFO
    createGeoPoint({ latitude: 21.324513, longitude: -157.925074 }), // HNL
  ]);
  const setPointsRef = useRef(setPoints);
  setPointsRef.current = setPoints;

  const polyline = useMemo(() => createPolylineState({
    id: 'example_polyline',
    points,
    strokeColor: '#ff0000',
    strokeWidth: 4,
    geodesic: true,
    onClick: event => {
      setClickMarkers(prev => [...prev, createMarkerState({
        id: `polyline-click-${prev.length}`,
        position: event.clicked,
        animation: MarkerAnimation.Drop,
        icon: new ColorDefaultIcon(event.state.strokeColor),
      })]);
    },
  }), [points]);
  const straightPolyline = useMemo(() => polyline.copy({
    id: `${polyline.id}-straight`,
    geodesic: false,
    strokeColor: '#0000ff',
  }), [polyline]);

  // polyline/basic の Android サンプルと同じウェイポイントマーカー:
  // 始点 = 緑 "S"、終点 = 緑 "E"、中間 = 黄 <index>、ドラッグでポリライン頂点を更新。
  const waypointMarkers = useMemo(() =>
    points.map((point, index) => {
      const isStart = index === 0;
      const isEnd = index === points.length - 1;
      const fillColor = isStart || isEnd ? ENDPOINT_FILL_COLOR : MIDDLE_FILL_COLOR;
      const label = isStart ? 'S' : isEnd ? 'E' : String(index);
      return createMarkerState({
        id: `waypoint-${index}`,
        position: point,
        extra: index,
        draggable: true,
        clickable: false,
        icon: new ColorDefaultIcon(fillColor, {
          strokeColor: WAYPOINT_STROKE_COLOR,
          label,
          labelTextColor: '#000000',
        }),
        onDragStart: (state: MarkerState) => {
          const idx = state.extra as number;
          setPointsRef.current(prev => {
            const next = [...prev];
            next[idx] = state.position;
            return next;
          });
        },
        onDrag: (state: MarkerState) => {
          const idx = state.extra as number;
          setPointsRef.current(prev => {
            const next = [...prev];
            next[idx] = state.position;
            return next;
          });
        },
        onDragEnd: (state: MarkerState) => {
          const idx = state.extra as number;
          setPointsRef.current(prev => {
            const next = [...prev];
            next[idx] = state.position;
            return next;
          });
        },
      });
    }),
  [points]);

  return (
    <MapViewContainer state={mapViewState}>
      <Polyline state={polyline} />
      <Polyline state={straightPolyline} />
      <Markers states={waypointMarkers} />
      <Markers states={clickMarkers} />
      <ControlPanel title={t('Description', '説明')}>
        <p className="control-panel-note">
          {t(
            'Tap the curved polyline. A marker is placed at the tapped position.',
            '曲線のポリラインをタップすると、タップした位置にマーカーが追加されます。',
          )}
        </p>
        <p className="control-panel-note">
          {t(
            'Drag the waypoint markers (green endpoints, yellow middle) to reshape the polyline.',
            'ウェイポイントマーカー（緑の端点・黄の中間）をドラッグしてポリラインの形を変更できます。',
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
