import { useMemo } from 'react';
import { InfoBubbleCustom, Marker } from '@mapconductor/js-sdk-react';
import { cityMarker } from '../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 43.0642, lng: 141.3469, zoom: 13 };

export function RichContentBubblePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const marker = useMemo(() => cityMarker('rich-bubble', 'Rich', 43.06417, 141.34694), []);
  return (
    <MapViewContainer state={mapViewState}>
      <Marker state={marker} />
      <InfoBubbleCustom marker={marker} tailOffset={{ x: 0.5, y: 1 }}>
        <div className="rich-bubble">
          <strong>Rich content</strong>
          <span>Status: open</span>
          <button>Details</button>
        </div>
      </InfoBubbleCustom>
    </MapViewContainer>
  );
}
