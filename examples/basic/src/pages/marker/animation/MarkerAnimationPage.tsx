import { useMemo, useState } from 'react';
import { ColorDefaultIcon, MarkerAnimation, createMarkerState } from '@mapconductor/js-sdk-core';
import { Marker } from '@mapconductor/js-sdk-react';
import { ControlPanel } from '../../../components/ControlPanel';
import { HONOLULU } from '../../common/sampleHelpers';
import { MapViewContainer } from '../../../MapViewContainer';
import { useSampleI18n } from '../../../i18n';

const INIT_CAMERA = { lat: 21.3825, lng: -157.9330, zoom: 14 };

export function MarkerAnimationPage() {
  const { t } = useSampleI18n();
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
    <MapViewContainer initialCamera={INIT_CAMERA}>
      <Marker state={marker} />
      <ControlPanel title={t('Marker Animation', 'マーカーアニメーション')}>
        <div className="button-grid">
          <button onClick={() => triggerAnimation(MarkerAnimation.Drop)}>{t('Drop marker', 'ドロップ')}</button>
          <button onClick={() => triggerAnimation(MarkerAnimation.Bounce)}>{t('Bounce marker', 'バウンド')}</button>
        </div>
        <p className="control-panel-note">
          {t(
            'Tap the marker or a button to trigger an animation.',
            'マーカーまたはボタンをタップしてアニメーションを実行します。',
          )}
        </p>
      </ControlPanel>
    </MapViewContainer>
  );
}
