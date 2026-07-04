import { useMemo } from 'react';
import { createGeoPoint, createPolygonState } from '@mapconductor/js-sdk-core';
import { Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 30.0, lng: 20.0, zoom: 2 };

export function PolygonGeodesicPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const points = useMemo(() => [
    createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
    createGeoPoint({ latitude: 21.3069, longitude: -157.8583 }),
    createGeoPoint({ latitude: 40.7128, longitude: -74.006 }),
  ], []);

  return (
    <MapViewContainer state={mapViewState}>
      <Polygon state={createPolygonState({
        id: 'linear-triangle',
        points,
        fillColor: 'rgba(37, 99, 235, 0.22)',
        strokeColor: '#2563eb',
        strokeWidth: 2,
        geodesic: false,
      })} />
      <Polygon state={createPolygonState({
        id: 'geodesic-triangle',
        points,
        fillColor: 'rgba(245, 158, 11, 0.18)',
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        geodesic: true,
      })} />
      <ControlPanel title="Polygon Geodesic">
        <p className="control-panel-note">Blue uses straight screen-space edges. Orange uses geodesic interpolation.</p>
      </ControlPanel>
    </MapViewContainer>
  );
}
