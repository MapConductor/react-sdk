import { useMemo, useState } from 'react';
import { ColorDefaultIcon, createGeoPoint, createMarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 37.7749, lng: -122.4194, zoom: 15, tilt: 45 };

export function MultipleBubblesPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [selectedMarkerIds, setSelectedMarkerIds] = useState<Set<string>>(
    () => new Set(['marker_0', 'marker_1', 'marker_2'])
  );
  const markers = useMemo(
    () =>
      [
        {
          position: createGeoPoint({ latitude: 37.7749, longitude: -122.4194 }),
          name: 'Restaurant A',
          color: '#ef4444',
        },
        {
          position: createGeoPoint({ latitude: 37.7849, longitude: -122.4094 }),
          name: 'Hotel B',
          color: '#2563eb',
        },
        {
          position: createGeoPoint({ latitude: 37.7649, longitude: -122.4294 }),
          name: 'Shop C',
          color: '#22c55e',
        },
      ].map((data, index) =>
        createMarkerState({
          id: `marker_${index}`,
          position: data.position,
          icon: new ColorDefaultIcon(data.color, { label: `${index + 1}`, labelTextColor: '#ffffff' }),
          extra: data.name,
          onClick: state => {
            setSelectedMarkerIds(prev => {
              const next = new Set(prev);
              if (next.has(state.id)) next.delete(state.id);
              else next.add(state.id);
              return next;
            });
          },
        })
      ),
    []
  );

  return (
    <MapViewContainer state={mapViewState} onMapClick={() => setSelectedMarkerIds(new Set())}>
      <Markers states={markers} />
      {markers.map(marker =>
        selectedMarkerIds.has(marker.id) ? (
          <InfoBubble key={marker.id} marker={marker} bubbleColor="#ffffff" borderColor="#000000">
            <button
              type="button"
              className="multi-bubble-content"
              onClick={() =>
                setSelectedMarkerIds(prev => {
                  const next = new Set(prev);
                  next.delete(marker.id);
                  return next;
                })
              }
            >
              <strong>{marker.extra as string}</strong>
              <span>Tap to close</span>
            </button>
          </InfoBubble>
        ) : null
      )}
    </MapViewContainer>
  );
}
