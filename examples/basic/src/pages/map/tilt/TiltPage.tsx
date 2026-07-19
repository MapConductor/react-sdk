import { useRef, useState } from 'react';
import type { MapDesignTypeInterface, MapViewStateInterface } from '@mapconductor/js-sdk-core';
import { ControlPanel, SliderControl } from '../../../components/ControlPanel';
import { MapViewContainer, useSampleMapViewState } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 21.3069, lng: -157.8583, zoom: 14 };

function TiltContent({ mapViewState }: { mapViewState: MapViewStateInterface<MapDesignTypeInterface<unknown>> }) {
  const { t } = useSampleI18n();
  const [tilt, setTilt] = useState(0);
  const cameraPositionRef = useRef(mapViewState.cameraPosition);

  return (
    <ControlPanel title={t('Tilt', '傾き')}>
      <SliderControl
        label={t('Tilt', '傾き')}
        value={tilt}
        min={-60}
        max={60}
        step={1}
        format={value => `${value.toFixed(0)}°`}
        onChange={value => {
          setTilt(value);
          const nextCameraPosition = cameraPositionRef.current.copy({ tilt: value });
          cameraPositionRef.current = nextCameraPosition;
          mapViewState.moveCameraTo(nextCameraPosition, 400);
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
