import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <GroundImage state={groundImageState} />
  <Markers states={cornerMarkers} />
</MapViewContainer>`,
  state: `const [groundImageState] = useState(() => createGroundImageState({
  id: 'historic-map', imageUrl, bounds: initialBounds, opacity: 0.7,
}));

const moveSouthWest = (markerState: MarkerState) => {
  groundImageState.bounds = createGeoRectBounds({
    southWest: markerState.position,
    northEast: groundImageState.bounds.northEast,
  });
};

const southWestMarker = createMarkerState({
  id: 'south-west', position: groundImageState.bounds.southWest!,
  draggable: true, onDrag: moveSouthWest, onDragEnd: moveSouthWest,
});
const cornerMarkers = [southWestMarker, northEastMarker];`,
  explanation: {
    en: [
      'Keep one GroundImageState instance and update its bounds from the draggable corner markers.',
      'A single GroundImageState is created with useState and never replaced; dragging a corner calls moveSouthWest, which assigns a fresh createGeoRectBounds to groundImageState.bounds.',
      'Because the state is observable, every bounds assignment is pushed to the map provider, so the overlaid image stretches to follow the corner markers.',
    ],
    ja: [
      'GroundImageState は1つのインスタンスを保持し、ドラッグできる隅のマーカーから bounds を更新します。',
      'GroundImageState は useState で1つだけ生成して差し替えず、隅をドラッグすると moveSouthWest が新しい createGeoRectBounds を groundImageState.bounds へ代入します。',
      'state は Observable なので、bounds の代入ごとに地図プロバイダーへ伝わり、重ねた画像が隅のマーカーに追従して伸縮します。',
    ],
    'es-419': [
      'Conserva una instancia de GroundImageState y actualiza sus límites desde marcadores de esquina arrastrables.',
      'Se crea un único GroundImageState con useState y nunca se reemplaza; arrastrar una esquina llama a moveSouthWest, que asigna un createGeoRectBounds nuevo a groundImageState.bounds.',
      'Como el estado es observable, cada asignación de límites se envía al proveedor del mapa, por lo que la imagen superpuesta se estira para seguir a los marcadores de esquina.',
    ],
    de: [
      'Eine einzige GroundImageState-Instanz behalten und ihre bounds aus den ziehbaren Eck-Markern aktualisieren.',
      'Ein einziger GroundImageState wird mit useState erzeugt und nie ersetzt; das Ziehen einer Ecke ruft moveSouthWest auf, das groundImageState.bounds ein frisches createGeoRectBounds zuweist.',
      'Weil der State beobachtbar ist, wird jede bounds-Zuweisung an den Kartenanbieter durchgereicht, sodass sich das eingeblendete Bild den Eck-Markern anpasst.',
    ],
    th: [
      'คงอินสแตนซ์ GroundImageState ไว้ตัวเดียว แล้วอัปเดต bounds จากมาร์กเกอร์มุมที่ลากได้',
      'GroundImageState ถูกสร้างด้วย useState เพียงตัวเดียวและไม่เคยถูกแทนที่ การลากมุมจะเรียก moveSouthWest ซึ่งกำหนด createGeoRectBounds ตัวใหม่ให้ groundImageState.bounds',
      'เนื่องจากสถานะนี้สังเกตการณ์ได้ ทุกการกำหนดค่า bounds จึงถูกส่งต่อไปยังผู้ให้บริการแผนที่ ภาพที่ซ้อนอยู่จึงยืดตามมาร์กเกอร์มุม',
    ],
    hi: [
      'GroundImageState का एक ही इंस्टेंस बनाए रखें और खींचे जा सकने वाले कोने के मार्कर से उसके bounds अपडेट करें।',
      'useState से एक ही GroundImageState बनता है और कभी बदला नहीं जाता; कोई कोना खींचने पर moveSouthWest चलता है, जो groundImageState.bounds में नया createGeoRectBounds डाल देता है।',
      'स्टेट अवलोकनीय है, इसलिए bounds की हर नियुक्ति मैप प्रोवाइडर तक पहुँच जाती है और ऊपर रखी इमेज कोने के मार्कर के साथ खिंच जाती है।',
    ],
  },
};

export default doc;
