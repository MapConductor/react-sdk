import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColorDefaultIcon,
  createGeoPoint,
  createGeoRectBounds,
  createGroundImageState,
  createMarkerState,
  createPolylineState,
  type GeoPoint,
  type MarkerState,
} from '@mapconductor/js-sdk-core';
import { GroundImage, Markers, Polyline } from '@mapconductor/js-sdk-react';
import { ControlPanel, SliderControl } from '../../components/ControlPanel';
import { Toast, useToast } from '../../components/Toast';
import { MapViewContainer } from '../../MapViewContainer';
import { useSampleI18n } from '../../samples/i18n';

const INIT_CAMERA = { lat: -26.479235, lng: 31.306239, zoom: 15 };
const GROUND_IMAGE_URL = `${import.meta.env.BASE_URL}university_of_eswatini.png`;

export function GroundImagePage() { 
  const { t } = useSampleI18n();
  const { messages, showToast, dismissToast } = useToast();
  const [southWest, setSouthWest] = useState(createGeoPoint({ latitude: -26.484901389754125, longitude: 31.2995982170105 }));
  const [northEast, setNorthEast] = useState(createGeoPoint({ latitude: -26.473569450536356, longitude: 31.31288051605225 }));
  const [opacity, setOpacity] = useState(1.0);

  const [image] = useState(() => createGroundImageState({
    id: 'ground-image',
    bounds: createGeoRectBounds({ southWest, northEast }),
    imageUrl: GROUND_IMAGE_URL,
    opacity,
    onClick: () => {
      showToast('Ground image clicked.');
    },
  }));

  // The rectangular frame around the ground image: NE → NW → SW → SE → NE.
  const framePoints = useCallback((sw: GeoPoint, ne: GeoPoint): GeoPoint[] => [
    ne,
    createGeoPoint({ latitude: ne.latitude, longitude: sw.longitude }),
    sw,
    createGeoPoint({ latitude: sw.latitude, longitude: ne.longitude }),
    ne,
  ], []);

  const [polylineState] = useState(() =>
    createPolylineState({ id: 'groundimage-frame', points: framePoints(southWest, northEast) }),
  );

  // Track the live corner positions so a drag handler can rebuild the geometry
  // from the dragged corner plus the *current* opposite corner without waiting
  // for React state (which updates asynchronously and would lag the drag).
  const southWestRef = useRef(southWest);
  const northEastRef = useRef(northEast);

  useEffect(() => {
    image.opacity = opacity;
  }, [image, opacity]);

  // Update the ground image bounds and frame polyline from the given corners.
  const applyGeometry = useCallback((sw: GeoPoint, ne: GeoPoint) => {
    image.bounds = createGeoRectBounds({ southWest: sw, northEast: ne });
    polylineState.points = framePoints(sw, ne);
  }, [image, polylineState, framePoints]);

  // During the drag we only rebuild the geometry (via refs), not React state, so
  // the marker array isn't recreated mid-drag (which would fight the native drag).
  const dragSouthWest = useCallback((state: MarkerState) => {
    southWestRef.current = state.position;
    applyGeometry(state.position, northEastRef.current);
  }, [applyGeometry]);

  const dragNorthEast = useCallback((state: MarkerState) => {
    northEastRef.current = state.position;
    applyGeometry(southWestRef.current, state.position);
  }, [applyGeometry]);

  // On drag end, also sync React state so the marker's controlled position keeps
  // its new spot on the next render.
  const commitSouthWest = useCallback((state: MarkerState) => {
    dragSouthWest(state);
    setSouthWest(state.position);
  }, [dragSouthWest]);

  const commitNorthEast = useCallback((state: MarkerState) => {
    dragNorthEast(state);
    setNorthEast(state.position);
  }, [dragNorthEast]);

  const markers = useMemo(() => [
    createMarkerState({
      id: 'south_west',
      position: southWest,
      icon: new ColorDefaultIcon({ fillColor: '#2563eb', label: 'SW', labelTextColor: '#ffffff' }),
      draggable: true,
      onDrag: dragSouthWest,
      onDragEnd: commitSouthWest,
    }),
    createMarkerState({
      id: 'north_east',
      position: northEast,
      icon: new ColorDefaultIcon({ fillColor: '#ef4444', label: 'NE', labelTextColor: '#ffffff' }),
      draggable: true,
      onDrag: dragNorthEast,
      onDragEnd: commitNorthEast,
    }),
  ], [northEast, southWest, dragSouthWest, commitSouthWest, dragNorthEast, commitNorthEast]);

  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <GroundImage state={image} />
      <Markers states={markers} />
      <Polyline state={polylineState} />
      <ControlPanel title={t('Ground Image', '地表画像')}>
        <SliderControl label={t('Opacity', '透明度')} value={opacity} min={0} max={1} onChange={setOpacity} />
        <p className="control-panel-note">
          {t('Drag the SW/NE markers to change image bounds.', '南西／北東マーカーをドラッグして画像範囲を変更できます。')}
        </p>
        <p className="control-panel-note">
          Aerial imagery © Open Imagery Network contributors, accessed via OpenAerialMap, licensed under CC BY 4.0.
          Source: <a href="https://map.openaerialmap.org/#/31.306132078170773,-26.47930278304649,16/square/300301322/5ca678b9b21ec90007944d55" target='_blank'>link</a>
        </p>
      </ControlPanel>
      <Toast messages={messages} onDismiss={dismissToast} />
    </MapViewContainer>
  );
}
