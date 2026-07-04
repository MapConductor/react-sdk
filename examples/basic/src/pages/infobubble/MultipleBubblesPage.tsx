import { useMemo } from 'react';
import { InfoBubble, Markers } from '@mapconductor/js-sdk-react';
import { cityMarker } from '../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 43.065, lng: 141.345, zoom: 12 };

export function MultipleBubblesPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const markers = useMemo(() => [
    cityMarker('bubble-1', 'One', 43.06417, 141.34694),
    cityMarker('bubble-2', 'Two', 43.07, 141.36),
    cityMarker('bubble-3', 'Three', 43.055, 141.33),
  ], []);

  return (
    <MapViewContainer state={mapViewState}>
      <Markers states={markers} />
      {markers.map(marker => (
        <InfoBubble key={marker.id} marker={marker}>
          <div className="bubble-content">{marker.extra as string}</div>
        </InfoBubble>
      ))}
    </MapViewContainer>
  );
}
