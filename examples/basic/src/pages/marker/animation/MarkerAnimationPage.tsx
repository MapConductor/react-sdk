import { useMemo, useState } from 'react';
import { ColorDefaultIcon, MarkerAnimation, createMarkerState } from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { HONOLULU } from '../../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3825, lng: -157.9330, zoom: 14 };

export function MarkerAnimationPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [bounce, setBounce] = useState(false);
  const marker = useMemo(() => createMarkerState({
    id: 'animated-marker',
    position: HONOLULU,
    icon: new ColorDefaultIcon('#e74c3c', { label: bounce ? 'B' : 'M', labelTextColor: '#ffffff' }),
    animation: bounce ? MarkerAnimation.Bounce : null,
    onClick: state => {
      state.animate(MarkerAnimation.Bounce);
      setBounce(true);
      window.setTimeout(() => setBounce(false), 800);
    },
  }), [bounce]);

  return (
    <MapViewContainer state={mapViewState}>
      <Marker state={marker} />
      <ControlPanel title="Marker Animation">
        <button onClick={() => setBounce(true)}>Bounce marker</button>
        <p className="control-panel-note">Tap the marker or the button to trigger the sample animation state.</p>
      </ControlPanel>
    </MapViewContainer>
  );
}
