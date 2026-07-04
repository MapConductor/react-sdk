import { useState } from 'react';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { ControlPanel, SliderControl } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 14 };

function TiltContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
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
          mapViewState.moveCameraTo(mapViewState.cameraPosition.copy({ tilt: value }), 400);
        }}
      />
    </ControlPanel>
  );
}

export function TiltPage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  return (
    <MapViewContainer state={mapViewState}>
      <TiltContent mapViewState={mapViewState} />
    </MapViewContainer>
  );
}
