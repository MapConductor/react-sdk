import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <GeoJSONLayer state={layerState} features={features} />
  {selected && (
    <InfoBubble position={selected.position}>
      <pre>{JSON.stringify(selected.properties, null, 2)}</pre>
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const features = useMemo(() => GeoJSONParser.parseFeatures(JSON.stringify({
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: { name: 'Sample railway' },
    geometry: { type: 'LineString', coordinates: [[139.75, 35.68], [139.77, 35.69], [139.79, 35.68]] },
  }],
})), []);
const [selected, setSelected] = useState<{
  position: GeoPoint; properties: Record<string, unknown>;
} | null>(null);
const layerState = useMemo(() => new GeoJSONLayerState({
  strokeColor: colorArgb(200, 250, 36, 29),
  strokeWidth: 6,
  onClick: (feature, position) => setSelected({ position: createGeoPoint(position), properties: feature.properties ?? {} }),
}), []);
const handleMapClick = (point: GeoPoint) => {
  if (!layerState.processClick(point, 10, mapViewState.cameraPosition.zoom)) setSelected(null);
};`,
  explanation: {
    'en': [
      'The inline GeoJSON contains a sample railway line, so the snippet needs no data server.',
      'handleMapClick calls processClick with the current zoom. A hit invokes layerState.onClick, which stores the feature properties and click position for the InfoBubble; a miss clears the selection.',
    ],
    'ja': [
      '外部データサーバーなしで試せるよう、説明用の鉄道路線を GeoJSON としてコード内に用意しています。',
      'handleMapClick は現在のズームを渡して processClick を呼びます。ヒット時に layerState.onClick が属性とクリック地点を保存して InfoBubble へ表示し、何もない場所をクリックすると選択を解除します。',
    ],
    'es-419': [
      'El GeoJSON incluido contiene una línea de ferrocarril de ejemplo y no necesita servidor de datos.',
      'handleMapClick llama a processClick con el zoom actual. onClick guarda las propiedades para el InfoBubble cuando hay un acierto; de lo contrario borra la selección.',
    ],
    'de': [
      'Das eingebettete GeoJSON enthält eine Beispielbahnlinie und benötigt keinen Datenserver.',
      'handleMapClick ruft processClick mit dem aktuellen Zoom auf. Bei einem Treffer speichert onClick die Attribute für die InfoBubble; andernfalls wird die Auswahl aufgehoben.',
    ],
    'th': [
      'GeoJSON ในโค้ดมีเส้นทางรถไฟตัวอย่าง จึงไม่ต้องใช้เซิร์ฟเวอร์ข้อมูล',
      'handleMapClick เรียก processClick ด้วยระดับซูมปัจจุบัน เมื่อพบฟีเจอร์ onClick จะเก็บคุณสมบัติให้ InfoBubble หากไม่พบจะล้างการเลือก',
    ],
    'hi': [
      'कोड के GeoJSON में उदाहरण रेल लाइन है, इसलिए डेटा सर्वर की ज़रूरत नहीं।',
      'handleMapClick वर्तमान ज़ूम से processClick बुलाता है। फ़ीचर मिलने पर onClick गुणों को InfoBubble के लिए रखता है; न मिलने पर चयन हटता है।',
    ],
  },
};

export default doc;
