import { useMemo } from 'react';
import { createGeoPoint, createMarkerState, createPolygonState, createPolylineState, type GeoPoint } from '@mapconductor/js-sdk-core';
import { Marker, Polygons, Polylines } from '@mapconductor/js-sdk-react';
import { LoadingOverlay, useLoadingOverlay } from '../../../components/LoadingOverlay';

/** Opaque colours, so a pixel shows which one is on top. */
export const STACK_SQUARE_COLOR = '#7C3AED';
export const STACK_ROAD_COLOR = '#00C853';

const ROWS = 50;
const STEP = 0.0004;
const SIZE = 0.0003;
// Degrees of latitude the marker stands south of the road of its cell.
const MARKER_BELOW_ROAD = 0.0001;

/**
 * `?stack=1` on the trees page: other overlays where the trees are, to check the stack by pixel.
 * Bottom to top it must read: polygon tiles (2,500 squares, enough to be tiled) < the tree
 * circles (tiled) < road tiles (2,500 short polylines, tiled too) < the marker.
 *
 * Each square has a road along its north edge's inner side, so trees, squares and roads overlap
 * in every cell; the road of the cell at the centre runs across the marker.
 */
export function StackCheck({ center }: { center: GeoPoint }) {
  const loading = useLoadingOverlay();
  const { squares, roads } = useMemo(() => {
    const squares = [];
    const roads = [];
    const p = (a: number, b: number) => createGeoPoint({ latitude: a, longitude: b });
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const lat = center.latitude - (ROWS / 2) * STEP + i * STEP;
        const lng = center.longitude - (ROWS / 2) * STEP + j * STEP;
        squares.push(createPolygonState({
          id: `stack-sq-${i}-${j}`,
          points: [p(lat, lng), p(lat, lng + SIZE), p(lat + SIZE, lng + SIZE), p(lat + SIZE, lng)],
          fillColor: STACK_SQUARE_COLOR,
          strokeColor: 'transparent',
          strokeWidth: 0,
        }));
        // From inside the square to past its east edge: over the square, then over the bare map.
        const roadLat = lat + SIZE * 0.75;
        roads.push(createPolylineState({
          id: `stack-road-${i}-${j}`,
          points: [p(roadLat, lng + SIZE * 0.25), p(roadLat, lng + STEP)],
          strokeColor: STACK_ROAD_COLOR,
          strokeWidth: 4,
        }));
      }
    }
    return { squares, roads };
  }, [center]);
  const marker = useMemo(() => createMarkerState({
    id: 'stack-marker',
    // A little south of the road, so the road runs across the pin's head.
    position: createGeoPoint({ latitude: center.latitude + SIZE * 0.75 - MARKER_BELOW_ROAD, longitude: center.longitude + SIZE * 0.6 }),
  }), [center]);
  return (
    <>
      <Polygons states={squares} {...loading.bind('polygons')} />
      <Polylines states={roads} {...loading.bind('polylines')} />
      <LoadingOverlay visible={loading.active} />
      <Marker state={marker} />
    </>
  );
}
