import { useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createGeoRectBounds,
  createGroundImageState,
  createMarkerState,
} from '@mapconductor/js-sdk-core';
import { GroundImage, Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { Toast, useToast } from '../../components/Toast';
import { MapViewContainer, useSampleMapViewState } from '../../MapViewContainer';

const INIT_CAMERA = { lat: 40.7410, lng: -74.1758, zoom: 11 };
const GROUND_IMAGE_URL = `${import.meta.env.BASE_URL}newark_nj_1922_0.webp`;
const CLICKED_GROUND_IMAGE_URL = `${import.meta.env.BASE_URL}newark_nj_1922_1.webp`;

export function GroundImagePage() {
  const mapViewState = useSampleMapViewState(INIT_CAMERA);
  const { messages, showToast, dismissToast } = useToast();
  const [southWest, setSouthWest] = useState(createGeoPoint({ latitude: 40.712216, longitude: -74.22655 }));
  const [northEast, setNorthEast] = useState(createGeoPoint({ latitude: 40.773941, longitude: -74.12544 }));
  const [opacity, setOpacity] = useState(0.5);
  const [clicked, setClicked] = useState(false);

  const markers = useMemo(() => [
    createMarkerState({
      id: 'south_west',
      position: southWest,
      icon: new ColorDefaultIcon('#2563eb', { label: 'SW', labelTextColor: '#ffffff' }),
      draggable: true,
      onDrag: state => setSouthWest(state.position),
    }),
    createMarkerState({
      id: 'north_east',
      position: northEast,
      icon: new ColorDefaultIcon('#ef4444', { label: 'NE', labelTextColor: '#ffffff' }),
      draggable: true,
      onDrag: state => setNorthEast(state.position),
    }),
  ], [northEast, southWest]);

  const image = useMemo(() => createGroundImageState({
    id: 'ground-image',
    bounds: createGeoRectBounds({ southWest, northEast }),
    imageUrl: clicked ? CLICKED_GROUND_IMAGE_URL : GROUND_IMAGE_URL,
    opacity,
    onClick: () => {
      setClicked(value => !value);
      showToast('Ground image clicked.');
    },
  }), [clicked, northEast, opacity, showToast, southWest]);

  return (
    <MapViewContainer state={mapViewState}>
      <GroundImage state={image} />
      <Markers states={markers} />
      <ControlPanel title="Ground Image">
        <SliderControl label="Opacity" value={opacity} min={0} max={1} onChange={setOpacity} />
        <p className="control-panel-note">Drag the SW/NE markers to change image bounds.</p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
