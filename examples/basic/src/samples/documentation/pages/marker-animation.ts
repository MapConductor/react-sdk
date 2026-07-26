import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `const marker = createMarkerState({
  position,
  animation: MarkerAnimation.Drop,
  onClick: state => state.animate(MarkerAnimation.Bounce),
});

<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
</MapViewContainer>`,
  state: `const position = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });`,
  explanation: {
    en: [
      'Set an initial marker animation and trigger another one through the shared marker state API.',
      'The marker is created with animation: MarkerAnimation.Drop, so it drops onto its fixed position the moment it mounts.',
      'Its onClick calls state.animate(MarkerAnimation.Bounce), showing that animations are commanded through the same MarkerState API on every provider.',
    ],
    ja: [
      '初期アニメーションを設定し、共通のマーカー State API から別のアニメーションを実行します。',
      'マーカーは animation: MarkerAnimation.Drop 付きで生成されるため、マウント時に固定位置へ落下してきます。',
      'onClick は state.animate(MarkerAnimation.Bounce) を呼び出し、アニメーションがどのプロバイダーでも同じ MarkerState API から指示されることを示します。',
    ],
    'es-419': [
      'Configura una animación inicial y activa otra mediante la API compartida del estado del marcador.',
      'El marcador se crea con animation: MarkerAnimation.Drop, por lo que cae sobre su posición fija en cuanto se monta.',
      'Su onClick llama a state.animate(MarkerAnimation.Bounce), demostrando que las animaciones se ordenan mediante la misma API de MarkerState en cada proveedor.',
    ],
  },
};

export default doc;
