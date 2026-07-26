import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={() => setSelected(false)}>
  <Marker state={marker} />
  {selected && (
    <InfoBubble marker={marker}>Hello, MapConductor</InfoBubble>
  )}
</MapViewContainer>`,
  state: `const [selected, setSelected] = useState(false);
const marker = useMemo(() => createMarkerState({
  id: 'hello',
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  onClick: () => setSelected(true),
}), []);`,
  explanation: {
    en: [
      'The simplest MapConductor example: one marker that opens a "Hello, MapConductor" bubble when tapped.',
      "A boolean flag lives in useState, and the marker's onClick flips it to true; onMapClick resets it so the bubble closes when you tap elsewhere.",
      'The InfoBubble renders only while the flag is true and is anchored to the marker — the core pattern of state-driven overlays.',
    ],
    ja: [
      'MapConductor のいちばん簡単な例。マーカーを1つ置き、タップすると「Hello, MapConductor」の吹き出しが開きます。',
      '真偽値を useState で保持し、マーカーの onClick で true にします。onMapClick で false に戻すため、別の場所をタップすると吹き出しが閉じます。',
      'InfoBubble はフラグが true の間だけ、マーカーに固定して描画されます。これが State 駆動オーバーレイの基本パターンです。',
    ],
    'es-419': [
      'El ejemplo más simple de MapConductor: un marcador que abre un globo «Hello, MapConductor» al tocarlo.',
      'Una bandera booleana vive en useState y el onClick del marcador la pone en true; onMapClick la restablece para cerrar el globo al tocar en otro lugar.',
      'El InfoBubble se dibuja solo mientras la bandera es true y queda anclado al marcador: el patrón central de superposiciones dirigidas por estado.',
    ],
  },
};

export default doc;
