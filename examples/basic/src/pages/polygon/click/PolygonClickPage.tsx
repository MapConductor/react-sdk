import { useMemo } from 'react';
import { createGeoPoint, createPolygonState } from '@mapconductor/js-sdk-core';
import { Polygon } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { Toast, useToast } from '../../../components/Toast';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 36.0, lng: -120.0, zoom: 7 };

export function PolygonClickPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const { messages, showToast, dismissToast } = useToast();
  const polygons = useMemo(() => [
    createPolygonState({
      id: 'sf-shape',
      points: [
        createGeoPoint({ latitude: 37.82, longitude: -122.52 }),
        createGeoPoint({ latitude: 37.83, longitude: -122.35 }),
        createGeoPoint({ latitude: 37.70, longitude: -122.32 }),
        createGeoPoint({ latitude: 37.68, longitude: -122.50 }),
      ],
      fillColor: 'rgba(37, 99, 235, 0.32)',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      onClick: event => showToast(`Blue polygon clicked\n${event.clicked.toUrlValue(5)}`),
    }),
    createPolygonState({
      id: 'la-shape',
      points: [
        createGeoPoint({ latitude: 34.13, longitude: -118.52 }),
        createGeoPoint({ latitude: 34.13, longitude: -118.18 }),
        createGeoPoint({ latitude: 33.94, longitude: -118.16 }),
        createGeoPoint({ latitude: 33.92, longitude: -118.48 }),
      ],
      fillColor: 'rgba(239, 68, 68, 0.28)',
      strokeColor: '#ef4444',
      strokeWidth: 2,
      onClick: event => showToast(`Red polygon clicked\n${event.clicked.toUrlValue(5)}`),
    }),
  ], [showToast]);

  return (
    <MapViewContainer state={mapViewState}>
      {polygons.map(polygon => <Polygon key={polygon.id} state={polygon} />)}
      <ControlPanel title="Polygon Click">
        <p className="control-panel-note">Tap either polygon to show a toast with the clicked location.</p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
