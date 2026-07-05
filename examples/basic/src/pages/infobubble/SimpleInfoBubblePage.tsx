import { useMemo, useState } from 'react';
import { ColorDefaultIcon, createGeoPoint, createMarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const SAN_FRANCISCO = createGeoPoint({ latitude: 37.7749, longitude: -122.4194 });
const INIT_CAMERA = { lat: 37.7749, lng: -122.4194, zoom: 10 };

export function SimpleInfoBubblePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('simple-text-bubble');
  const marker = useMemo(() => createMarkerState({
    id: 'simple-text-bubble',
    position: SAN_FRANCISCO,
    icon: new ColorDefaultIcon('#2563eb', { label: 'SF', labelTextColor: '#ffffff' }),
    extra: 'San Francisco - The Golden Gate City',
    onClick: state => setSelectedMarkerId(state.id),
  }), []);

  return (
    <MapViewContainer state={mapViewState} onMapClick={() => setSelectedMarkerId(null)}>
      <Marker state={marker} />
      {selectedMarkerId === marker.id && (
        <InfoBubble marker={marker}>
          <div className="bubble-content simple-text-bubble">
            {marker.extra as string}
          </div>
        </InfoBubble>
      )}
    </MapViewContainer>
  );
}
