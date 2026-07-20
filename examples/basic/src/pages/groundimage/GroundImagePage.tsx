import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createGeoRectBounds,
  createGroundImageState,
  createMarkerState,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { GroundImage, Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { Toast, useToast } from '../../components/Toast';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../i18n';

const INIT_CAMERA = { lat: 40.7410, lng: -74.1758, zoom: 11 };
const GROUND_IMAGE_URL = `${import.meta.env.BASE_URL}newark_nj_1922_0.webp`;
const CLICKED_GROUND_IMAGE_URL = `${import.meta.env.BASE_URL}newark_nj_1922_1.webp`;

export function GroundImagePage() {
  const { t } = useSampleI18n();
  const { messages, showToast, dismissToast } = useToast();
  const [southWest, setSouthWest] = useState(createGeoPoint({ latitude: 40.712216, longitude: -74.22655 }));
  const [northEast, setNorthEast] = useState(createGeoPoint({ latitude: 40.773941, longitude: -74.12544 }));
  const [opacity, setOpacity] = useState(0.5);
  const [clicked, setClicked] = useState(false);

  const [image] = useState(() => createGroundImageState({
    id: 'ground-image',
    bounds: createGeoRectBounds({ southWest, northEast }),
    imageUrl: GROUND_IMAGE_URL,
    opacity,
    onClick: () => {
      setClicked(value => !value);
      showToast('Ground image clicked.');
    },
  }));

  useEffect(() => {
    image.imageUrl = clicked ? CLICKED_GROUND_IMAGE_URL : GROUND_IMAGE_URL;
  }, [clicked, image]);

  useEffect(() => {
    image.opacity = opacity;
  }, [image, opacity]);

  const updateSouthWest = useCallback((state: MarkerState) => {
    setSouthWest(state.position);
    image.bounds = createGeoRectBounds({
      southWest: state.position,
      northEast: image.bounds.northEast,
    });
  }, [image]);

  const updateNorthEast = useCallback((state: MarkerState) => {
    setNorthEast(state.position);
    image.bounds = createGeoRectBounds({
      southWest: image.bounds.southWest,
      northEast: state.position,
    });
  }, [image]);

  const markers = useMemo(() => [
    createMarkerState({
      id: 'south_west',
      position: southWest,
      icon: new ColorDefaultIcon('#2563eb', { label: 'SW', labelTextColor: '#ffffff' }),
      draggable: true,
      onDrag: updateSouthWest,
      onDragEnd: updateSouthWest,
    }),
    createMarkerState({
      id: 'north_east',
      position: northEast,
      icon: new ColorDefaultIcon('#ef4444', { label: 'NE', labelTextColor: '#ffffff' }),
      draggable: true,
      onDrag: updateNorthEast,
      onDragEnd: updateNorthEast,
    }),
  ], [northEast, southWest, updateNorthEast, updateSouthWest]);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <GroundImage state={image} />
      <Markers states={markers} />
      <ControlPanel title={t('Ground Image', '地表画像')}>
        <SliderControl label={t('Opacity', '透明度')} value={opacity} min={0} max={1} onChange={setOpacity} />
        <p className="control-panel-note">
          {t('Drag the SW/NE markers to change image bounds.', '南西／北東マーカーをドラッグして画像範囲を変更できます。')}
        </p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
