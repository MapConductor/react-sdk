import {
  createGeoPoint,
  createMapCameraPosition,
  createPolygonState,
  createPolylineState,
  type PolygonState,
  type PolylineState,
} from '@mapconductor/js-sdk-core';
import type { CameraLocationInfo } from './types';

export const INITIAL_CAMERA = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
  zoom: 12,
  bearing: 0,
  tilt: 0,
});

export const PROGRAMMATIC_TTL_MS = 1200;
export const PROGRAMMATIC_GRACE_MS = 250;
export const MOVE_SYNC_INTERVAL_MS = 33;
export const FLY_TO_DURATION_MS = 1000;

export function defaultLocations(): CameraLocationInfo[] {
  return [
    {
      name: 'Tokyo',
      bounds: {
        southWest: createGeoPoint({ latitude: 35.62, longitude: 139.7, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 35.74, longitude: 139.84, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 35.6812, longitude: 139.7671, altitude: 0 }),
      zoom: 12,
    },
    {
      name: 'French Southern and Antarctic Lands',
      bounds: {
        southWest: createGeoPoint({ latitude: -49.5, longitude: 50, altitude: 0 }),
        northEast: createGeoPoint({ latitude: -37.5, longitude: 77, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: -43.5, longitude: 63.5, altitude: 0 }),
      zoom: 4,
    },
    {
      name: 'Finland',
      bounds: {
        southWest: createGeoPoint({ latitude: 59.8, longitude: 19.1, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 70.1, longitude: 31.6, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 64.95, longitude: 25.35, altitude: 0 }),
      zoom: 5,
    },
    {
      name: 'Iceland',
      bounds: {
        southWest: createGeoPoint({ latitude: 63.3, longitude: -24.5, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 66.6, longitude: -13.5, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 64.95, longitude: -19, altitude: 0 }),
      zoom: 6,
    },
    {
      name: 'Kiribati',
      bounds: {
        southWest: createGeoPoint({ latitude: -11.5, longitude: -174.5, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 5, longitude: -147, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: -3.25, longitude: -160.75, altitude: 0 }),
      zoom: 4.5,
    },
    {
      name: 'Oahu Island',
      bounds: {
        southWest: createGeoPoint({ latitude: 21.25, longitude: -158.3, altitude: 0 }),
        northEast: createGeoPoint({ latitude: 21.7, longitude: -157.65, altitude: 0 }),
      },
      center: createGeoPoint({ latitude: 21.475, longitude: -157.975, altitude: 0 }),
      zoom: 9.5,
    },
  ];
}

export function boundsPolyline(location: CameraLocationInfo, index: number): PolylineState {
  const sw = location.bounds.southWest;
  const ne = location.bounds.northEast;
  return createPolylineState({
    id: `camera_sync_bounds_${index}`,
    points: [
      sw,
      createGeoPoint({ latitude: sw.latitude, longitude: ne.longitude, altitude: 0 }),
      ne,
      createGeoPoint({ latitude: ne.latitude, longitude: sw.longitude, altitude: 0 }),
      sw,
    ],
    strokeColor: '#dc2626',
    strokeWidth: 3,
    geodesic: true,
  });
}

export function referenceRectangles(locations: CameraLocationInfo[]): PolygonState[] {
  const size = 1;
  return locations.map((location, index) => {
    const lat = location.center.latitude;
    const lng = location.center.longitude;
    return createPolygonState({
      id: `camera_sync_reference_${index}`,
      points: [
        createGeoPoint({ latitude: lat - size / 2, longitude: lng - size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat - size / 2, longitude: lng + size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat + size / 2, longitude: lng + size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat + size / 2, longitude: lng - size / 2, altitude: 0 }),
        createGeoPoint({ latitude: lat - size / 2, longitude: lng - size / 2, altitude: 0 }),
      ],
      strokeColor: '#2563eb',
      strokeWidth: 2,
      fillColor: 'rgba(37, 99, 235, 0.1)',
      geodesic: false,
      zIndex: 1,
    });
  });
}
