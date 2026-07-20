import { useMemo, useRef } from 'react';
import { createGeoPoint, createMarkerState, type MarkerState } from '@mapconductor/js-sdk-core';
import { Markers } from '@mapconductor/js-sdk-react';
import { Toast, useToast } from '../components/Toast';
import { MapViewContainer } from '../MapViewContainer';

const INIT_CAMERA = { lat: 21.2910, lng: -157.8380, zoom: 12 };

const MARKER_DATA = [
  { lat: 21.3069, lng: -157.8583, label: 'A', name: 'Downtown Honolulu' },
  { lat: 21.2830, lng: -157.8370, label: 'B', name: 'Ala Moana Center' },
  { lat: 21.2785, lng: -157.8270, label: 'C', name: 'Waikiki Beach' },
];

export function MarkerPage() {
  const { messages, showToast, dismissToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const markers = useMemo(
    () =>
      MARKER_DATA.map(({ lat, lng, label, name }) =>
        createMarkerState({
          position: createGeoPoint({ latitude: lat, longitude: lng }),
          extra: `${label}: ${name}`,
          clickable: true,
          onClick: (state: MarkerState) => {
            showToastRef.current(`Clicked: ${state.extra as string}`);
          },
        })
      ),
    []
  );

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Markers states={markers} />
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
