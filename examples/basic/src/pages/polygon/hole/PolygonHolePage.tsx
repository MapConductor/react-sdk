import { useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createMarkerState,
  createPolygonState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 43.0602, lng: 141.3195, zoom: 11 };
const WORLD_POINTS = [
  createGeoPoint({ latitude: 85, longitude: 90 }),
  createGeoPoint({ latitude: 85, longitude: 0.1 }),
  createGeoPoint({ latitude: 85, longitude: -90 }),
  createGeoPoint({ latitude: 85, longitude: -179.9 }),
  createGeoPoint({ latitude: -85, longitude: -179.9 }),
  createGeoPoint({ latitude: -85, longitude: -90 }),
  createGeoPoint({ latitude: -85, longitude: 0.1 }),
  createGeoPoint({ latitude: -85, longitude: 90 }),
  createGeoPoint({ latitude: -85, longitude: 179.9 }),
  createGeoPoint({ latitude: 85, longitude: 179.9 }),
];
const INITIAL_HOLES = [
  [
    createGeoPoint({ latitude: 43.100869, longitude: 141.352909 }),
    createGeoPoint({ latitude: 43.044443, longitude: 141.411895 }),
    createGeoPoint({ latitude: 43.050601, longitude: 141.306563 }),
  ],
  [
    createGeoPoint({ latitude: 43.060351, longitude: 141.319905 }),
    createGeoPoint({ latitude: 43.038285, longitude: 141.333247 }),
    createGeoPoint({ latitude: 43.049062, longitude: 141.286901 }),
  ],
];
const HOLE_MARKER_COLORS = ['#2563eb', '#f97316'];

export function PolygonHolePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [holes, setHoles] = useState<GeoPoint[][]>(() => INITIAL_HOLES.map(hole => [...hole]));
  const setHolesRef = useRef(setHoles);
  setHolesRef.current = setHoles;

  const state = useMemo(
    () =>
      createPolygonState({
        id: 'world-hole',
        points: WORLD_POINTS,
        holes,
        fillColor: 'rgba(120, 120, 128, 0.8)',
        strokeColor: '#ef4444',
        strokeWidth: 2,
      }),
    [holes]
  );

  const vertexMarkers = useMemo(
    () =>
      holes.flatMap((hole, holeIndex) =>
        hole.map((point, vertexIndex) => {
          const label = `${holeIndex + 1}-${vertexIndex + 1}`;
          const updateHoleVertex = (markerState: MarkerState) => {
            setHolesRef.current(prev =>
              prev.map((prevHole, prevHoleIndex) =>
                prevHoleIndex !== holeIndex
                  ? prevHole
                  : prevHole.map((prevPoint, prevVertexIndex) =>
                      prevVertexIndex === vertexIndex ? markerState.position : prevPoint
                    )
              )
            );
          };

          return createMarkerState({
            id: `hole-${holeIndex}-${vertexIndex}`,
            position: point,
            draggable: true,
            clickable: false,
            icon: new ColorDefaultIcon(HOLE_MARKER_COLORS[holeIndex] ?? '#64748b', {
              label,
              labelTextColor: '#ffffff',
              strokeColor: '#ffffff',
            }),
            onDrag: updateHoleVertex,
            onDragEnd: updateHoleVertex,
          });
        })
      ),
    [holes]
  );

  return (
    <MapViewContainer state={mapViewState}>
      <Polygon state={state} />
      <Markers states={vertexMarkers} />
      <ControlPanel title="Hole Polygon">
        <p className="control-panel-note">Drag hole vertex markers to reshape the holes.</p>
      </ControlPanel>
    </MapViewContainer>
  );
}
