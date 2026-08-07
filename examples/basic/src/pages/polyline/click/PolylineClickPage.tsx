import { useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  MarkerAnimation,
  createGeoPoint,
  createMarkerState,
  createPolylineState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

const INIT_CAMERA = { lat: 35.548852, lng: 139.784086, zoom: 4 };

export function PolylineClickPage() {
  const { t } = useSampleI18n();
  const [clickMarkers, setClickMarkers] = useState<MarkerState[]>([]);
  // The Android polyline-click sample draws no waypoint markers, so neither do
  // we: the points only feed the polylines below.
  const [points] = useState<GeoPoint[]>(() => [
    createGeoPoint({ latitude: 35.548852, longitude: 139.784086 }), // HND
    createGeoPoint({ latitude: 37.615223, longitude: -122.389979 }), // SFO
    createGeoPoint({ latitude: 21.324513, longitude: -157.925074 }), // HNL
  ]);

  const polyline = useMemo(() => createPolylineState({
    id: 'example_polyline',
    points,
    strokeColor: '#ff0000',
    strokeWidth: 4,
    geodesic: true,
    onClick: event => {
      setClickMarkers(prev => [...prev, createMarkerState({
        id: `polyline-click-${prev.length}`,
        position: event.clicked,
        animation: MarkerAnimation.Drop,
        icon: new ColorDefaultIcon({ fillColor: event.state.strokeColor }),
        clickable: false,
      })]);
    },
  }), [points]);
  const straightPolyline = useMemo(() => polyline.copy({
    id: `${polyline.id}-straight`,
    geodesic: false,
    strokeColor: '#0000ff',
  }), [polyline]);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Polyline state={polyline} />
      <Polyline state={straightPolyline} />
      <Markers states={clickMarkers} />
      <ControlPanel title={t('Description', '説明')}>
        <p className="control-panel-note">
          {t(
            'Tap the curved polyline. A marker is placed at the tapped position.',
            '曲線のポリラインをタップすると、タップした位置にマーカーが追加されます。',
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
