import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  Spherical,
  calculatePositionAtDistance,
  computeDistanceBetween,
  createCircleState,
  createGeoPoint,
  type GeoPoint,
  type MapDesignTypeInterface,
  type MapViewStateInterface,
  type MarkerState,
  type Offset,
} from '@mapconductor/js-sdk-core';
import { Circle, Marker, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../components/ControlPanel';
import { Toast, useToast } from '../components/Toast';
import { MapViewContainer } from '../MapViewContainer';
import { useSampleI18n } from '../i18n';

const CIRCLE_CENTER = createGeoPoint({ latitude: 21.382314, longitude: -157.933097 });
const INIT_CAMERA = { lat: CIRCLE_CENTER.latitude, lng: CIRCLE_CENTER.longitude, zoom: 12 };
const INITIAL_RADIUS_METERS = 1000;
const SUPPRESS_CIRCLE_CLICK_AFTER_MARKER_DRAG_MS = 300;
const CIRCLE_COLORS = ['#0000ff', '#ff0000', '#008000', '#00ffff', '#d3d3d3', '#ff00ff'];

function rgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function radiusLabelPosition(
  center: GeoPoint,
  edge: GeoPoint,
  mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>>,
): Offset | null | Promise<Offset | null> {
  const holder = mapViewState.getMapViewHolder();
  if (!holder) return null;
  const midpoint = Spherical.linearInterpolate({ from: center, to: edge, fraction: 0.5 });
  return holder.toScreenOffset(midpoint);
}

export function CirclePage() {
  const { t } = useSampleI18n();
  const [mapViewState, setMapViewState] = useState<MapViewStateInterface<MapDesignTypeInterface<unknown>> | null>(null);
  const [edgePosition, setEdgePosition] = useState(() =>
    calculatePositionAtDistance({
      center: CIRCLE_CENTER,
      distanceMeters: INITIAL_RADIUS_METERS,
      bearingDegrees: 90,
    }),
  );
  const [colorIndex, setColorIndex] = useState(0);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [labelOffset, setLabelOffset] = useState<Offset | null>(null);
  const [cameraTick, setCameraTick] = useState(0);
  const suppressCircleClickUntilRef = useRef(0);
  const { messages, showToast, dismissToast } = useToast();
  const radius = useMemo(
    () => computeDistanceBetween(CIRCLE_CENTER, edgePosition),
    [edgePosition],
  );

  const updateLabelPosition = useCallback(() => {
    if (!mapViewState) {
      setLabelOffset(null);
      return;
    }
    const next = radiusLabelPosition(CIRCLE_CENTER, edgePosition, mapViewState);
    if (next instanceof Promise) {
      next.then(setLabelOffset).catch(() => setLabelOffset(null));
    } else {
      setLabelOffset(next);
    }
  }, [edgePosition, mapViewState]);

  useEffect(() => {
    updateLabelPosition();
    const raf = requestAnimationFrame(updateLabelPosition);
    return () => cancelAnimationFrame(raf);
  }, [cameraTick, updateLabelPosition]);

  const handleMarkerMove = useCallback((dragged: MarkerState) => {
    setEdgePosition(dragged.position);
  }, []);

  const handleMarkerDragEnd = useCallback((dragged: MarkerState) => {
    suppressCircleClickUntilRef.current =
      Date.now() + SUPPRESS_CIRCLE_CLICK_AFTER_MARKER_DRAG_MS;
    setEdgePosition(dragged.position);
  }, []);

  const circleState = useMemo(
    () =>
      createCircleState({
        id: 'circle',
        center: CIRCLE_CENTER,
        radiusMeters: radius,
        fillColor: rgba(CIRCLE_COLORS[colorIndex], fillOpacity),
        strokeColor: 'rgba(0, 0, 255, 0.5)',
        strokeWidth,
        zIndex: 0,
        clickable: true,
        onClick: () => {
          if (Date.now() < suppressCircleClickUntilRef.current) return;
          setColorIndex((index) => (index + 1) % CIRCLE_COLORS.length);
          showToast(`Circle clicked - Radius: ${radius.toFixed(0)}m`);
        },
      }),
    [colorIndex, fillOpacity, radius, showToast, strokeWidth],
  );

  const centerIcon = useMemo(
    () => new ColorDefaultIcon('#ff0000', { strokeColor: '#ffffff', label: 'C' }),
    [],
  );
  const edgeIcon = useMemo(
    () => new ColorDefaultIcon('#008000', { strokeColor: '#ffffff', label: 'E' }),
    [],
  );

  return (
    <MapViewContainer
      initialCamera={INIT_CAMERA}
      onStateReady={setMapViewState}
      onCameraMove={() => setCameraTick((tick) => tick + 1)}
      onCameraMoveEnd={() => setCameraTick((tick) => tick + 1)}
    >
      <Circle state={circleState} />
      <Polyline
        id="circle-radius-line"
        points={[CIRCLE_CENTER, edgePosition]}
        strokeColor="#ffffff"
        strokeWidth={3}
        zIndex={1}
      />
      <Marker
        id="center_marker"
        position={CIRCLE_CENTER}
        icon={centerIcon}
        clickable={false}
        draggable={false}
      />
      <Marker
        id="edge_marker"
        position={edgePosition}
        icon={edgeIcon}
        draggable
        onDragStart={handleMarkerMove}
        onDrag={handleMarkerMove}
        onDragEnd={handleMarkerDragEnd}
      />
      {labelOffset && (
        <div
          className="circle-radius-label"
          style={{
            left: labelOffset.x,
            top: labelOffset.y,
          }}
        >
          {radius.toFixed(0)} m
        </div>
      )}
      <ControlPanel title={t('Circle Example', '円のサンプル')}>
        <SliderControl
          label={t('Fill Opacity', '塗りの透明度')}
          value={fillOpacity}
          min={0}
          max={1}
          onChange={setFillOpacity}
        />
        <SliderControl
          label={t('Stroke Width', '線の太さ')}
          value={strokeWidth}
          min={1}
          max={10}
          step={0.1}
          format={value => `${value.toFixed(1)}px`}
          onChange={setStrokeWidth}
        />
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
