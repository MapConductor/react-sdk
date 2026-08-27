import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={clearSelection}>
  <Markers states={storeMarkers} />
  {selectedMarker && (
    <InfoBubble marker={selectedMarker}>
      <StoreInfoView store={selectedMarker.extra} />
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
const storeMarkers = useMemo(() => stores.map(store => createMarkerState({
  id: store.id,
  position: createGeoPoint({ latitude: store.lat, longitude: store.lng }),
  extra: store,
  onClick: markerState => setSelectedMarker(markerState),
})), [stores]);
const clearSelection = () => setSelectedMarker(null);`,
  explanation: {
    en: [
      'Render a collection of store markers in one composition and show an information bubble for the selected store.',
      'The storeMarkers array is built once with useMemo: each createMarkerState keeps its store record in the extra field and an onClick handler that saves the tapped MarkerState, while onMapClick clears the selection.',
      'The batched <Markers> component draws every store in a single pass, and the InfoBubble is anchored to the selected marker so StoreInfoView appears only while a store is chosen.',
    ],
    ja: [
      '店舗マーカーを一括で描画し、選択された店舗に情報を表示する吹き出しを重ねます。',
      'storeMarkers は useMemo で一度だけ生成し、各 createMarkerState は店舗データを extra に保持して、タップされた MarkerState を保存する onClick を持ちます。地図の余白をクリックすると選択が解除されます。',
      '一括描画用の <Markers> が全店舗を1回で描画し、InfoBubble は選択中のマーカーに固定されるため、店舗を選んだ間だけ StoreInfoView が表示されます。',
    ],
    'es-419': [
      'Dibuja una colección de marcadores de tiendas en una sola composición y muestra un globo de información para la tienda seleccionada.',
      'El arreglo storeMarkers se crea una vez con useMemo: cada createMarkerState guarda su registro de tienda en el campo extra y un onClick que almacena el MarkerState tocado, mientras que onMapClick borra la selección.',
      'El componente por lotes <Markers> dibuja todas las tiendas de una sola vez y el InfoBubble se ancla al marcador seleccionado, por lo que StoreInfoView aparece solo mientras hay una tienda elegida.',
    ],
    de: [
      'Eine Sammlung von Filial-Markern in einer Komposition rendern und für die ausgewählte Filiale eine Info-Sprechblase zeigen.',
      'Das storeMarkers-Array wird einmalig mit useMemo gebaut: jedes createMarkerState behält seinen Filialdatensatz im Feld extra und einen onClick-Handler, der den angetippten MarkerState sichert, während onMapClick die Auswahl aufhebt.',
      'Die gebündelte <Markers>-Komponente zeichnet alle Filialen in einem Durchgang, und die InfoBubble hängt am ausgewählten Marker, sodass StoreInfoView nur erscheint, solange eine Filiale gewählt ist.',
    ],
    th: [
      'เรนเดอร์มาร์กเกอร์ร้านค้าทั้งชุดในองค์ประกอบเดียว และแสดงบับเบิลข้อมูลของร้านที่เลือก',
      'อาร์เรย์ storeMarkers สร้างครั้งเดียวด้วย useMemo โดย createMarkerState แต่ละตัวเก็บระเบียนของร้านไว้ในฟิลด์ extra พร้อมตัวจัดการ onClick ที่บันทึก MarkerState ที่ถูกแตะ ส่วน onMapClick จะล้างการเลือก',
      'คอมโพเนนต์ <Markers> แบบรวมกลุ่มวาดทุกร้านในรอบเดียว และ InfoBubble ตรึงอยู่กับมาร์กเกอร์ที่เลือก StoreInfoView จึงปรากฏเฉพาะตอนที่มีร้านถูกเลือกอยู่',
    ],
    hi: [
      'स्टोर मार्कर का पूरा संग्रह एक ही रचना में रेंडर करें, और चुने हुए स्टोर के लिए इन्फ़ो बबल दिखाएँ।',
      'storeMarkers सरणी useMemo से एक बार बनती है: हर createMarkerState अपने स्टोर का रिकॉर्ड extra फ़ील्ड में रखता है और एक onClick हैंडलर, जो टैप किए गए MarkerState को सहेजता है; onMapClick चयन हटा देता है।',
      'बंडल किया हुआ <Markers> कंपोनेंट हर स्टोर को एक ही चक्कर में खींचता है, और InfoBubble चुने हुए मार्कर से बँधा रहता है, इसलिए StoreInfoView तभी दिखता है जब कोई स्टोर चुना हो।',
    ],
  },
};

export default doc;
