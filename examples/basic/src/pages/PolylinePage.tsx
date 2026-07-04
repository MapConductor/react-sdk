import { useMemo, useRef, useState } from 'react';
import {
  createMarkerState,
  createPolylineState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../components/ControlPanel';
import { Toast, useToast } from '../components/Toast';
import { POLYLINE_POINTS } from '../data/storeData';
import { MapViewContainer, useSampleMapViewState } from '../MapViewContainer';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 13 };

export function PolylinePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [points, setPoints] = useState<GeoPoint[]>(POLYLINE_POINTS);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const { messages, showToast, dismissToast } = useToast();
  const setPointsRef = useRef(setPoints);
  setPointsRef.current = setPoints;

  const polylineState = useMemo(
    () =>
      createPolylineState({
        id: 'demo-polyline',
        points,
        strokeColor: '#e74c3c',
        strokeWidth,
        geodesic: true,
        onClick: event =>
          showToast(
            `Polyline clicked near [${event.clicked.latitude.toFixed(4)}, ${event.clicked.longitude.toFixed(4)}]`
          ),
      }),
    [points, strokeWidth, showToast]
  );

  const waypointMarkers = useMemo(
    () =>
      points.map((point, index) =>
        createMarkerState({
          id: `wp-${index}`,
          position: point,
          draggable: index > 0 && index < points.length - 1,
          clickable: false,
          onDrag: (state: MarkerState) => {
            setPointsRef.current(prev => {
              const next = [...prev];
              next[index] = state.position;
              return next;
            });
          },
          onDragEnd: (state: MarkerState) => {
            setPointsRef.current(prev => {
              const next = [...prev];
              next[index] = state.position;
              return next;
            });
          },
        })
      ),
    [points]
  );

  return (
    <MapViewContainer state={mapViewState}>
      <Polyline state={polylineState} />
      <Markers states={waypointMarkers} />
      <ControlPanel title="Polyline Example">
        <SliderControl
          label="Stroke Width"
          value={strokeWidth}
          min={1}
          max={12}
          step={0.5}
          format={value => `${value.toFixed(1)}px`}
          onChange={setStrokeWidth}
        />
        <p className="control-panel-note">Drag waypoint markers to reshape the polyline.</p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
