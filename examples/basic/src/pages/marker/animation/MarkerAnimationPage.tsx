import { DefaultMarkerIcon, MarkerAnimation, createGeoPoint, createMarkerState } from '@mapconductor/js-sdk-core';
import { Markers } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../samples/i18n';

// android の AnimationPageViewModel.kt / ios の AnimationPageViewModel.swift と同一仕様:
// Drop / Bounce のラベルを持つ 2 マーカーを表示し、タップすると各マーカーに
// 紐づいたアニメーションが実行される。
const INIT_CAMERA = { lat: 21.382314, lng: -157.933097, zoom: 9 };

const SPOTS = [
  { id: 's1', name: 'Bounce', animation: MarkerAnimation.Bounce, latitude: 21.3069, longitude: -157.8583 },
  { id: 's2', name: 'Drop', animation: MarkerAnimation.Drop, latitude: 21.4513, longitude: -158.0152 },
] as const;

const MARKERS = SPOTS.map(spot =>
  createMarkerState({
    id: spot.id,
    position: createGeoPoint({ latitude: spot.latitude, longitude: spot.longitude }),
    icon: new DefaultMarkerIcon({ label: spot.name }),
    onClick: state => state.animate(spot.animation),
  }),
);

export function MarkerAnimationPage() {
  const { t } = useSampleI18n();
  return (
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Markers states={MARKERS} />
      <ControlPanel title={t('Marker Animation', 'マーカーアニメーション')}>
        <p className="control-panel-note">
          {t(
            'Tap a marker to run its animation (Drop / Bounce).',
            'マーカーをタップすると、そのマーカーのアニメーション（Drop / Bounce）が実行されます。',
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
