import { useMemo, useRef, useState } from 'react';
import {
  createMarkerState,
  createPolygonState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../components/ControlPanel';
import { Toast, useToast } from '../components/Toast';
import { POLYGON_VERTICES } from '../data/storeData';
import { MapViewContainer, useSampleMapViewState } from '../MapViewContainer';

const INIT_CAMERA = { lat: 41.7969, lng: 140.7569, zoom: 16 };

export function PolygonPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [vertices, setVertices] = useState<GeoPoint[]>(POLYGON_VERTICES);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const { messages, showToast, dismissToast } = useToast();
  const setVerticesRef = useRef(setVertices);
  setVerticesRef.current = setVertices;

  const polygonState = useMemo(
    () =>
      createPolygonState({
        id: 'demo-polygon',
        points: vertices,
        holes: [],
        strokeColor: '#e74c3c',
        strokeWidth,
        fillColor: `rgba(0, 100, 230, ${fillOpacity})`,
        geodesic: false,
        onClick: () => showToast('Polygon clicked'),
      }),
    [vertices, fillOpacity, strokeWidth, showToast]
  );

  const vertexMarkers = useMemo(
    () =>
      vertices.map((point, index) =>
        createMarkerState({
          id: `vertex-${index}`,
          position: point,
          draggable: true,
          clickable: false,
          onDrag: (state: MarkerState) => {
            setVerticesRef.current(prev => {
              const next = [...prev];
              next[index] = state.position;
              return next;
            });
          },
          onDragEnd: (state: MarkerState) => {
            setVerticesRef.current(prev => {
              const next = [...prev];
              next[index] = state.position;
              return next;
            });
          },
        })
      ),
    [vertices]
  );

  return (
    <MapViewContainer state={mapViewState}>
      <Polygon state={polygonState} />
      <Markers states={vertexMarkers} />
      <ControlPanel title="Polygon Example">
        <SliderControl
          label="Fill Opacity"
          value={fillOpacity}
          min={0}
          max={1}
          debounce={150}
          onChange={setFillOpacity}
        />
        <SliderControl
          label="Stroke Width"
          value={strokeWidth}
          min={1}
          max={10}
          step={0.5}
          format={value => `${value.toFixed(1)}px`}
          onChange={setStrokeWidth}
        />
        <p className="control-panel-note">Drag vertex markers to reshape the polygon.</p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
