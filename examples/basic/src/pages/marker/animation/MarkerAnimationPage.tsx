import { useMemo, useState } from 'react';
import { ColorDefaultIcon, MarkerAnimation, createMarkerState } from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { HONOLULU } from '../../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3825, lng: -157.9330, zoom: 14 };

export function MarkerAnimationPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [animation, setAnimation] = useState<MarkerAnimation | null>(null);

  const triggerAnimation = (nextAnimation: MarkerAnimation) => {
    setAnimation(nextAnimation);
    window.setTimeout(() => setAnimation(null), 900);
  };

  const marker = useMemo(() => createMarkerState({
    id: 'animated-marker',
    position: HONOLULU,
    icon: new ColorDefaultIcon('#e74c3c', {
      label: animation === MarkerAnimation.Drop ? 'D' : animation === MarkerAnimation.Bounce ? 'B' : 'M',
      labelTextColor: '#ffffff',
    }),
    animation,
    onClick: state => {
      state.animate(MarkerAnimation.Bounce);
      triggerAnimation(MarkerAnimation.Bounce);
    },
  }), [animation]);

  return (
    <MapViewContainer state={mapViewState}>
      <Marker state={marker} />
      <ControlPanel title="Marker Animation">
        <div className="button-grid">
          <button onClick={() => triggerAnimation(MarkerAnimation.Drop)}>Drop marker</button>
          <button onClick={() => triggerAnimation(MarkerAnimation.Bounce)}>Bounce marker</button>
        </div>
        <p className="control-panel-note">Tap the marker or the button to trigger the sample animation state.</p>
      </ControlPanel>
    </MapViewContainer>
  );
}
