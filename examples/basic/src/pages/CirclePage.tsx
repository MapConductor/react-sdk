import { useMemo, useState } from 'react';
import { createCircleState } from '@mapconductor/js-sdk-core';
import { Circle, MarkerFromProps } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../components/ControlPanel';
import { Toast, useToast } from '../components/Toast';
import { CIRCLE_CENTER } from '../data/storeData';
import { MapViewContainer, useSampleMapViewState } from '../MapViewContainer';

const INIT_CAMERA = { lat: 21.3825, lng: -157.9330, zoom: 12 };

export function CirclePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const [radius, setRadius] = useState(1000);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const { messages, showToast, dismissToast } = useToast();

  const circleState = useMemo(
    () =>
      createCircleState({
        id: 'demo-circle',
        center: CIRCLE_CENTER,
        radiusMeters: radius,
        fillColor: `rgba(0, 100, 255, ${fillOpacity})`,
        strokeColor: '#0064ff',
        strokeWidth,
        clickable: true,
        onClick: () => showToast(`Circle clicked - radius: ${radius.toFixed(0)}m`),
      }),
    [radius, fillOpacity, strokeWidth, showToast]
  );

  return (
    <MapViewContainer state={mapViewState}>
      <Circle state={circleState} />
      <MarkerFromProps position={CIRCLE_CENTER} clickable={false} />
      <ControlPanel title="Circle Example">
        <SliderControl
          label="Radius"
          value={radius}
          min={100}
          max={5000}
          step={50}
          format={value => `${value.toFixed(0)}m`}
          onChange={setRadius}
        />
        <SliderControl
          label="Fill Opacity"
          value={fillOpacity}
          min={0}
          max={1}
          onChange={setFillOpacity}
        />
        <SliderControl
          label="Stroke Width"
          value={strokeWidth}
          min={1}
          max={10}
          step={0.5}
          format={value => `${value.toFixed(1)}px`}
          onChange={setStrokeWidth}
        />
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
