import {
  ColorDefaultIcon,
  createGeoPoint,
  createMarkerState,
} from '@mapconductor/js-sdk-core';

export const HONOLULU = createGeoPoint({ latitude: 21.382314, longitude: -157.933097 });
export const SAPPORO = createGeoPoint({ latitude: 43.06417, longitude: 141.34694 });

export function cityMarker(id: string, label: string, latitude: number, longitude: number) {
  return createMarkerState({
    id,
    position: createGeoPoint({ latitude, longitude }),
    extra: label,
    icon: new ColorDefaultIcon('#2563eb', { label: label.slice(0, 1), labelTextColor: '#ffffff' }),
  });
}
