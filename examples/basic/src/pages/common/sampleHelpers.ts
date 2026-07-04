import {
  ColorDefaultIcon,
  createGeoPoint,
  createMapCameraPosition,
  createMarkerState,
  type GeoPoint,
} from '@mapconductor/js-sdk-core';
import { useMapViewController } from '@mapconductor/js-sdk-react';

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

export function useCameraActions() {
  const controller = useMapViewController();

  return {
    getBounds: () => controller?.getBounds() ?? null,
    getCameraPosition: () => controller?.getCameraPosition() ?? null,
    animateCamera: (center: GeoPoint, duration = 800, zoom = 13, bearing = 0, tilt = 0) => {
      if (!controller) return;
      void controller.animateCamera(createMapCameraPosition({ position: center, zoom, bearing, tilt }), { duration });
    },
  };
}
