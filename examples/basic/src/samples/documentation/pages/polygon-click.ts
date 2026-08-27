import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={showClickedMarker}>
  {polygons.map(polygon => (
    <Polygon
      key={polygon.id}
      state={polygon.copy({
        onClick: event => showClickedMarker(event.clicked),
      })}
    />
  ))}
  {marker && (
    <>
      <Marker state={marker} />
      <InfoBubble marker={marker}>{message}</InfoBubble>
    </>
  )}
</MapViewContainer>`,
  state: `const polygons = useMemo(() => california.map((points, index) =>
  createPolygonState({ id: \`california-\${index}\`, points }),
), []);
const polygonManager = useMemo(() => {
  const manager = new PolygonManager<null>();
  polygons.forEach(polygon => manager.registerEntity(
    createPolygonEntity({ polygon: null, state: polygon }),
  ));
  return manager;
}, [polygons]);
const [marker, setMarker] = useState<MarkerState | null>(null);
const [message, setMessage] = useState('');
const showClickedMarker = (clicked: GeoPoint) => {
  setMessage(polygonManager.find(clicked) ? 'Inside' : 'Outside');
  setMarker(createMarkerState({ id: 'clicked', position: clicked }));
};`,
  explanation: {
    en: [
      'Receive polygon click events through the common overlay API and display information at the clicked coordinate.',
      'The California polygons are registered into a PolygonManager, whose find(clicked) runs a provider-independent point-in-polygon test.',
      'Both each Polygon’s onClick and the map’s onMapClick call showClickedMarker, which sets an "Inside" or "Outside" message and drops a marker with an InfoBubble at the clicked point.',
    ],
    ja: [
      '共通オーバーレイ API でポリゴンのクリックを受け取り、クリック座標に情報を表示します。',
      'カリフォルニアのポリゴンは PolygonManager に登録され、その find(clicked) がプロバイダー非依存の内外判定を行います。',
      '各 Polygon の onClick と地図の onMapClick はどちらも showClickedMarker を呼び、「Inside」または「Outside」のメッセージを設定して、クリック地点に InfoBubble 付きのマーカーを表示します。',
    ],
    'es-419': [
      'Recibe eventos de clic de polígono mediante la API de superposiciones común y muestra información en la coordenada tocada.',
      'Los polígonos de California se registran en un PolygonManager, cuyo find(clicked) ejecuta una prueba de punto en polígono independiente del proveedor.',
      'Tanto el onClick de cada Polygon como el onMapClick del mapa llaman a showClickedMarker, que fija un mensaje «Inside» u «Outside» y coloca un marcador con un InfoBubble en el punto tocado.',
    ],
    de: [
      'Polygon-Klickereignisse über die gemeinsame Overlay-API entgegennehmen und an der angeklickten Koordinate Informationen anzeigen.',
      'Die Kalifornien-Polygone werden in einen PolygonManager eingetragen, dessen find(clicked) einen anbieterunabhängigen Punkt-im-Polygon-Test ausführt.',
      'Sowohl das onClick jedes Polygon als auch das onMapClick der Karte rufen showClickedMarker auf, das eine Meldung „Inside“ oder „Outside“ setzt und am angeklickten Punkt einen Marker mit InfoBubble absetzt.',
    ],
    th: [
      'รับเหตุการณ์คลิกโพลีกอนผ่าน API โอเวอร์เลย์ร่วม แล้วแสดงข้อมูลที่พิกัดที่คลิก',
      'โพลีกอนของรัฐแคลิฟอร์เนียถูกลงทะเบียนไว้ใน PolygonManager ซึ่ง find(clicked) จะทดสอบจุดในโพลีกอนแบบไม่ผูกกับผู้ให้บริการ',
      'ทั้ง onClick ของแต่ละ Polygon และ onMapClick ของแผนที่ต่างเรียก showClickedMarker ซึ่งตั้งข้อความว่า “Inside” หรือ “Outside” แล้ววางมาร์กเกอร์พร้อม InfoBubble ที่จุดที่คลิก',
    ],
    hi: [
      'पॉलीगॉन के क्लिक इवेंट साझा ओवरले API से लें, और क्लिक किए गए निर्देशांक पर जानकारी दिखाएँ।',
      'कैलिफ़ोर्निया के पॉलीगॉन एक PolygonManager में दर्ज होते हैं, जिसका find(clicked) प्रोवाइडर-निरपेक्ष point-in-polygon जाँच चलाता है।',
      'हर Polygon का onClick और मैप का onMapClick, दोनों showClickedMarker बुलाते हैं, जो “Inside” या “Outside” का संदेश तय करता है और क्लिक की गई जगह पर InfoBubble वाला मार्कर रख देता है।',
    ],
  },
};

export default doc;
