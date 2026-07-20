import { useMemo, useState } from 'react';
import { ColorDefaultIcon, createGeoPoint, createMarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubbleCustom, Markers } from '@mapconductor/js-sdk-react';
import { MapViewContainer } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 37.7849, lng: -122.4094, zoom: 15 };

export function StyledInfoBubblePage() {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>('marker1');
  const markers = useMemo(() => {
    const marker1 = createMarkerState({
      id: 'marker1',
      position: createGeoPoint({ latitude: 37.7749, longitude: -122.4194 }),
      icon: new ColorDefaultIcon('#2563eb', {
        label: '1',
        labelTextColor: '#ffffff',
        infoAnchor: { x: 0.5, y: 0.25 },
      }),
      draggable: true,
      onClick: state => setSelectedMarkerId(state.id),
      onDragStart: state => console.log(`マーカーのドラッグを開始: ${state.id}`),
      onDrag: state => console.log('マーカーをドラッグ中:', state.position),
      onDragEnd: state => console.log(`マーカーのドラッグが終了: ${state.id}`),
    });
    const marker2 = createMarkerState({
      id: 'marker2',
      position: createGeoPoint({ latitude: 37.7849, longitude: -122.4094 }),
      icon: new ColorDefaultIcon('#ef4444', {
        label: '2',
        labelTextColor: '#ffffff',
        infoAnchor: { x: 0.5, y: 0.25 },
      }),
      onClick: state => setSelectedMarkerId(state.id),
    });
    return [marker1, marker2];
  }, []);
  const activeMarker = markers.find(marker => marker.id === selectedMarkerId);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA} onMapClick={() => setSelectedMarkerId(null)}>
      <Markers states={markers} />
      {activeMarker && (
        <InfoBubbleCustom marker={activeMarker} tailOffset={{ x: 0, y: 0.5 }}>
          <div className="right-tail-info-bubble">
            {activeMarker.position.toUrlValue(6)}
          </div>
        </InfoBubbleCustom>
      )}
    </MapViewContainer>
  );
}
