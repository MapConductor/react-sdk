import { useMemo, useState } from 'react';
import { ColorDefaultIcon, createGeoPoint, createMarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

interface LocationInfo extends Record<string, unknown> {
  name: string;
  description: string;
  rating: number;
}

const INIT_CAMERA = { lat: 37.7749, lng: -122.4194, zoom: 10 };

export function RichContentBubblePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('golden-gate-park');
  const marker = useMemo(() => {
    const locationInfo: LocationInfo = {
      name: 'Golden Gate Park',
      description: 'A large urban park with gardens, museums, and recreational areas.',
      rating: 4.5,
    };
    return createMarkerState({
      id: 'golden-gate-park',
      position: createGeoPoint({ latitude: 37.7694, longitude: -122.4862 }),
      icon: new ColorDefaultIcon('#22c55e', { label: '🌳' }),
      extra: locationInfo,
      onClick: state => setSelectedMarkerId(state.id),
    });
  }, []);
  const info = marker.extra as LocationInfo;

  return (
    <MapViewContainer state={mapViewState} onMapClick={() => setSelectedMarkerId(null)}>
      <Marker state={marker} />
      {selectedMarkerId === marker.id && (
        <InfoBubble
          marker={marker}
          bubbleColor="#ffffff"
          borderColor="#000000"
          contentPadding={16}
          cornerRadius={12}
        >
          <div className="rich-location-bubble">
            <strong>{info.name}</strong>
            <p>{info.description}</p>
            <div className="rating-row" aria-label={`${info.rating} out of 5`}>
              <span className="rating-stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} className={index < Math.floor(info.rating) ? 'filled' : ''}>★</span>
                ))}
              </span>
              <span>{info.rating}/5</span>
            </div>
          </div>
        </InfoBubble>
      )}
    </MapViewContainer>
  );
}
