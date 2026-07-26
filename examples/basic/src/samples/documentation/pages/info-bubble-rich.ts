import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
  <InfoBubble marker={marker} bubbleColor="#ffffff">
    <article>
      <h3>Place details</h3>
      <button onClick={openDetails}>Open details</button>
    </article>
  </InfoBubble>
</MapViewContainer>`,
  state: `const position = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });
const [selected, setSelected] = useState(false);
const marker = useMemo(() => createMarkerState({
  id: 'place', position, onClick: () => setSelected(true),
}), [position]);`,
  explanation: {
    en: [
      'Render interactive React elements inside a marker-anchored bubble, including headings and buttons.',
      'The bubble content is a full <article> with a heading and a button wired to openDetails.',
      'bubbleColor sets the background while the children remain ordinary React, so clicks and other handlers work normally inside the bubble.',
    ],
    ja: [
      '見出しやボタンなど、操作可能な React 要素をマーカーに固定した吹き出し内へ描画します。',
      '吹き出しの中身は見出しと、openDetails につないだボタンを持つ完全な <article> です。',
      'bubbleColor が背景色を設定し、子要素は通常の React のままなので、吹き出し内でもクリックなどのハンドラーがそのまま動きます。',
    ],
    'es-419': [
      'Dibuja elementos React interactivos, como encabezados y botones, dentro de un globo anclado a un marcador.',
      'El contenido del globo es un <article> completo con un encabezado y un botón conectado a openDetails.',
      'bubbleColor define el fondo mientras que los hijos siguen siendo React normal, así que los clics y otros manejadores funcionan dentro del globo.',
    ],
  },
};

export default doc;
