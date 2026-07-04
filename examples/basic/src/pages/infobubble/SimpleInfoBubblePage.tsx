import { useMemo } from 'react';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';
import { cityMarker } from '../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 43.0642, lng: 141.3469, zoom: 13 };

export function SimpleInfoBubblePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const marker = useMemo(() => cityMarker('simple-bubble', 'Sapporo', 43.06417, 141.34694), []);
  return (
    <MapViewContainer state={mapViewState}>
      <Marker state={marker} />
      <InfoBubble marker={marker}>
        <div className="bubble-content">Simple text bubble</div>
      </InfoBubble>
    </MapViewContainer>
  );
}
