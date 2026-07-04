import { useMemo } from 'react';
import { createGeoPoint, createPolygonState } from '@mapconductor/js-sdk-core';
import { Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 43.0602, lng: 141.3195, zoom: 11 };

export function PolygonHolePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const state = useMemo(() => createPolygonState({
    id: 'world-hole',
    points: [
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
    ],
    holes: [
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
    ],
    fillColor: 'rgba(120, 120, 128, 0.8)',
    strokeColor: '#ef4444',
    strokeWidth: 2,
  }), []);

  return (
    <MapViewContainer state={mapViewState}>
      <Polygon state={state} />
      <ControlPanel title="Hole Polygon">
        <p className="control-panel-note">A world-covering polygon with two triangular holes near Sapporo.</p>
      </ControlPanel>
    </MapViewContainer>
  );
}
