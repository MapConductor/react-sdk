import { useState } from 'react';
import { ControlPanel, SliderControl } from '../../../components/ControlPanel';
import { HONOLULU, useCameraActions } from '../../common/sampleHelpers';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 14 };

function TiltContent() {
  const { animateCamera, getCameraPosition } = useCameraActions();
  const [tilt, setTilt] = useState(0);

  return (
    <ControlPanel title="Tilt">
      <SliderControl
        label="Tilt"
        value={tilt}
        min={0}
        max={60}
        step={1}
        format={value => `${value.toFixed(0)}°`}
        onChange={value => {
          setTilt(value);
          const camera = getCameraPosition();
          animateCamera(camera?.center ?? HONOLULU, 400, camera?.zoom ?? 14, camera?.bearing ?? 0, value);
        }}
      />
    </ControlPanel>
  );
}

export function TiltPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  return (
    <MapViewContainer state={mapViewState}>
      <TiltContent />
    </MapViewContainer>
  );
}
