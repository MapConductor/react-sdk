import { useMemo } from 'react';
import { createGeoPoint, createMapCameraPosition, type MapCameraPosition } from '@mapconductor/js-sdk-core';
import type { InitialCamera } from '../common';

export function useInitialCameraPosition(initialCamera: InitialCamera): MapCameraPosition {
  return useMemo(() => createMapCameraPosition({
    position: createGeoPoint({ latitude: initialCamera.lat, longitude: initialCamera.lng }),
    zoom: initialCamera.zoom,
    bearing: initialCamera.bearing ?? 0,
    tilt: initialCamera.tilt ?? 0,
  }), [
    initialCamera.lat,
    initialCamera.lng,
    initialCamera.zoom,
    initialCamera.bearing,
    initialCamera.tilt,
  ]);
}
