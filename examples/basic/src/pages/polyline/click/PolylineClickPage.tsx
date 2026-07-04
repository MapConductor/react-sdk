import { useMemo, useState } from 'react';
import { ColorDefaultIcon, createGeoPoint, createMarkerState, createPolylineState, type MarkerState } from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { Toast, useToast } from '../../../components/Toast';
import { HONOLULU } from '../../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3823, lng: -157.9331, zoom: 14 };

export function PolylineClickPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const { messages, showToast, dismissToast } = useToast();
  const [markers, setMarkers] = useState<MarkerState[]>([]);
  const points = useMemo(() => [
    HONOLULU,
    createGeoPoint({ latitude: 21.385314, longitude: -157.930097 }),
    createGeoPoint({ latitude: 21.387314, longitude: -157.935097 }),
    createGeoPoint({ latitude: 21.380314, longitude: -157.937097 }),
    createGeoPoint({ latitude: 21.378314, longitude: -157.930097 }),
  ], []);
  const polyline = useMemo(() => createPolylineState({
    id: 'click-polyline',
    points,
    strokeColor: '#e74c3c',
    strokeWidth: 5,
    geodesic: true,
    onClick: event => {
      if (!event.clicked) return;
      showToast(`Polyline clicked near ${event.clicked.toUrlValue(5)}`);
      setMarkers(prev => [...prev, createMarkerState({
        id: `polyline-click-${prev.length}`,
        position: event.clicked,
        icon: new ColorDefaultIcon('#f59e0b', { label: `${prev.length + 1}` }),
      })]);
    },
  }), [points, showToast]);

  return (
    <MapViewContainer state={mapViewState}>
      <Polyline state={polyline} />
      <Markers states={markers} />
      <ControlPanel title="Polyline Click">
        <p className="control-panel-note">Tap the curved polyline. A marker is placed near the clicked point.</p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
