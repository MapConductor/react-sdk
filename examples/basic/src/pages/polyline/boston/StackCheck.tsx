import { useMemo } from 'react';
import { createCircleState, createGeoPoint, createMarkerState, createPolygonState, type GeoPoint } from '@mapconductor/js-sdk-core';
import { Circle, Marker, Polygons } from '@mapconductor/js-sdk-react';
import { LoadingOverlay, useLoadingOverlay } from '../../../components/LoadingOverlay';

/**
 * `?stack=1` on the roads page: other overlays where the roads are, to see the stack.
 * Bottom to top it must read: polygon tiles (a grid of 2,500 squares, enough to be tiled) <
 * the circle < the road tiles < the marker.
 */
export function StackCheck({ center }: { center: GeoPoint }) {
  const loading = useLoadingOverlay();
  const squares = useMemo(() => {
    const out = [];
    const step = 0.0004, size = 0.0003;
    for (let i = 0; i < 50; i++) {
      for (let j = 0; j < 50; j++) {
        const lat = center.latitude - 0.01 + i * step, lng = center.longitude - 0.01 + j * step;
        const p = (a: number, b: number) => createGeoPoint({ latitude: a, longitude: b });
        out.push(createPolygonState({
          id: `stack-sq-${i}-${j}`,
          points: [p(lat, lng), p(lat, lng + size), p(lat + size, lng + size), p(lat + size, lng)],
          fillColor: 'rgba(124, 58, 237, 0.85)',
          strokeColor: 'transparent',
          strokeWidth: 0,
        }));
      }
    }
    return out;
  }, [center]);
  const circle = useMemo(() => createCircleState({
    id: 'stack-circle', center: createGeoPoint({ latitude: center.latitude + 0.002, longitude: center.longitude + 0.003 }),
    radiusMeters: 180, fillColor: 'rgba(14, 165, 233, 0.9)', strokeColor: '#0369a1', strokeWidth: 2,
  }), [center]);
  const marker = useMemo(() => createMarkerState({ id: 'stack-marker', position: center }), [center]);
  return (
    <>
      <Polygons states={squares} {...loading.bind('polygons')} />
      <LoadingOverlay visible={loading.active} />
      <Circle state={circle} />
      <Marker state={marker} />
    </>
  );
}
