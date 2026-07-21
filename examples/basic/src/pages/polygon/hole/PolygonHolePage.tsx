import { useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createGeoRectBounds,
  createMarkerState,
  createPolygonState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 43.0602, lng: 141.3195, zoom: 11 };
// A regional mask generously covering the Sapporo area. Cesium cannot
// triangulate rings approaching hemisphere size (a world-spanning mask
// renders inverted or disappears), so keep the outer ring regional.
const OUTER_POINTS = [
  createGeoPoint({ latitude: 44.2, longitude: 140.0 }),
  createGeoPoint({ latitude: 44.2, longitude: 142.8 }),
  createGeoPoint({ latitude: 42.0, longitude: 142.8 }),
  createGeoPoint({ latitude: 42.0, longitude: 140.0 }),
];
// Keep the camera within the masked area — matches OUTER_POINTS exactly, so
// panning stops right at the edge of the region the polygon actually covers.
// Not applied on Google Maps (shared singleton map instance; see
// ProviderViewProps.restrictBounds).
const RESTRICT_BOUNDS = createGeoRectBounds({
  southWest: createGeoPoint({ latitude: 42.0, longitude: 140.0 }),
  northEast: createGeoPoint({ latitude: 44.2, longitude: 142.8 }),
});
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
  const { t } = useSampleI18n();
  const [holes, setHoles] = useState<GeoPoint[][]>(() => INITIAL_HOLES.map(hole => [...hole]));
  const setHolesRef = useRef(setHoles);
  setHolesRef.current = setHoles;

  const state = useMemo(
    () =>
      createPolygonState({
        id: 'world-hole',
        points: OUTER_POINTS,
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
    <MapViewContainer initialCamera={INIT_CAMERA} restrictBounds={RESTRICT_BOUNDS}>
      <Polygon state={state} />
      <Markers states={vertexMarkers} />
      <ControlPanel title={t('Polygon with Holes', '穴付きポリゴン')}>
        <p className="control-panel-note">
          {t('Drag hole vertex markers to reshape the holes.', '穴の頂点マーカーをドラッグして形を変更できます。')}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
