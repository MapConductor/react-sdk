import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <GeoJSONLayer state={layerState} features={features} />
  {selected && (
    <InfoBubble position={selected.position}>
      <PropertyTable properties={selected.properties} />
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
const [selected, setSelected] = useState<SelectedFeature | null>(null);
const layerState = useMemo(() => new GeoJSONLayerState({
  strokeColor: colorArgb(200, 250, 36, 29),
  strokeWidth: 6,
}), []);`,
  explanation: {
    en: [
      "Process clicks against GeoJSON features and show the selected feature's properties at the geographic click position.",
      'Both the features and the selected feature live in React state, and layerState is a GeoJSONLayerState holding the railway data.',
      'handleMapClick resolves which feature was hit and stores it, then InfoBubble anchors a PropertyTable of its properties at the clicked coordinate.',
    ],
    ja: [
      'GeoJSON Feature へのクリックを判定し、選択した Feature の属性をクリック地点に表示します。',
      'features と選択中の Feature はどちらも React の state に保持し、layerState は鉄道データ用の GeoJSONLayerState です。',
      'handleMapClick がどの Feature に当たったかを判定して保存し、InfoBubble がその属性の PropertyTable をクリック座標に固定します。',
    ],
    'es-419': [
      'Procesa clics sobre elementos GeoJSON y muestra las propiedades del elemento seleccionado en la posición geográfica del clic.',
      'Tanto los features como el elemento seleccionado viven en el estado de React, y layerState es un GeoJSONLayerState con los datos ferroviarios.',
      'handleMapClick determina qué elemento se tocó y lo almacena, luego InfoBubble ancla un PropertyTable de sus propiedades en la coordenada tocada.',
    ],
    de: [
      'Klicks gegen GeoJSON-Features auswerten und die Eigenschaften des getroffenen Features an der geografischen Klickposition zeigen.',
      'Sowohl die Features als auch das ausgewählte Feature liegen im React-State, und layerState ist ein GeoJSONLayerState mit den Bahndaten.',
      'handleMapClick ermittelt das getroffene Feature und merkt es sich, dann verankert InfoBubble eine PropertyTable seiner Eigenschaften an der angeklickten Koordinate.',
    ],
    th: [
      'ประมวลผลการคลิกกับฟีเจอร์ GeoJSON แล้วแสดงคุณสมบัติของฟีเจอร์ที่เลือกไว้ ณ ตำแหน่งภูมิศาสตร์ที่คลิก',
      'ทั้งฟีเจอร์และฟีเจอร์ที่เลือกอยู่ในสถานะของ React ส่วน layerState คือ GeoJSONLayerState ที่ถือข้อมูลเส้นทางรถไฟ',
      'handleMapClick หาว่าโดนฟีเจอร์ใดแล้วเก็บไว้ จากนั้น InfoBubble จะตรึง PropertyTable ของคุณสมบัตินั้นไว้ที่พิกัดที่คลิก',
    ],
    hi: [
      'क्लिक को GeoJSON फ़ीचर के विरुद्ध जाँचें और चुने गए फ़ीचर की प्रॉपर्टी उसी भौगोलिक जगह पर दिखाएँ।',
      'फ़ीचर और चुना गया फ़ीचर दोनों React स्टेट में रहते हैं, और layerState एक GeoJSONLayerState है जिसमें रेलवे का डेटा है।',
      'handleMapClick तय करता है कि कौन-सा फ़ीचर लगा और उसे रख लेता है; फिर InfoBubble उसकी प्रॉपर्टी की PropertyTable क्लिक किए गए निर्देशांक पर टिका देता है।',
    ],
  },
};

export default doc;
