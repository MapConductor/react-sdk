import { useState } from 'react';
import { ColorDefaultIcon, createMarkerState } from '@mapconductor/js-sdk-core';
import { InfoBubble, Marker } from '@mapconductor/js-sdk-react';
import { SAPPORO } from '../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 43.0642, lng: 141.3469, zoom: 13 };

export function StyledInfoBubblePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [marker] = useState(() => createMarkerState({
    id: 'styled-bubble',
    position: SAPPORO,
    draggable: true,
    icon: new ColorDefaultIcon('#7c3aed', { label: 'S', labelTextColor: '#ffffff' }),
  }));

  return (
    <MapViewContainer state={mapViewState}>
      <Marker state={marker} />
      <InfoBubble marker={marker} bubbleColor="#1f2937" borderColor="#a78bfa" cornerRadius={8}>
        <div className="bubble-content dark">
          <strong>Styled bubble</strong>
          <span>Drag the marker.</span>
        </div>
      </InfoBubble>
    </MapViewContainer>
  );
}
