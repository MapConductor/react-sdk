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
      <ControlPanel title={t(
        {
          en: 'Marker Animation',
          ja: 'マーカーアニメーション',
          'es-419': 'Animación de marcadores',
          de: 'Marker-Animation',
          th: 'แอนิเมชันมาร์กเกอร์',
          hi: 'मार्कर एनिमेशन',
        },
      )}>
        <p className="control-panel-note">
          {t(
            {
              en: 'Tap a marker to run its animation (Drop / Bounce).',
              ja: 'マーカーをタップすると、そのマーカーのアニメーション（Drop / Bounce）が実行されます。',
              'es-419': 'Toca un marcador para ejecutar su animación (Drop / Bounce).',
              de: 'Tippen Sie einen Marker an, um seine Animation abzuspielen (Drop / Bounce).',
              th: 'แตะมาร์กเกอร์เพื่อเล่นแอนิเมชันของมาร์กเกอร์นั้น (Drop / Bounce)',
              hi: 'किसी मार्कर पर टैप करने से उसका एनिमेशन चलता है (Drop / Bounce)।',
            },
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
