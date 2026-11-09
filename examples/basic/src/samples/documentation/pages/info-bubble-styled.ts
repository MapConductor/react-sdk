import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<label>Bubble <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} /></label>
<label>Border <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} /></label>
<label>Text <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} /></label>
<label>Marker <input type="color" value={markerColor} onChange={e => setMarkerColor(e.target.value)} /></label>
<input aria-label="Border width" type="range" min="0" max="8" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} />
<input aria-label="Marker scale" type="range" min="0.5" max="2" step="0.1" value={markerScale} onChange={e => setMarkerScale(Number(e.target.value))} />
<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
  <InfoBubble
    marker={marker}
    bubbleColor={fillColor}
    borderColor={strokeColor}
    borderWidth={strokeWidth}
    cornerRadius={6}
    contentPadding={10}
  >
    <div style={{ color: fontColor }}>Custom Styled Bubble</div>
  </InfoBubble>
</MapViewContainer>`,
  state: `const [fillColor, setFillColor] = useState('#ffffff');
const [strokeColor, setStrokeColor] = useState('#111827');
const [fontColor, setFontColor] = useState('#111827');
const [markerColor, setMarkerColor] = useState('#ef4444');
const [strokeWidth, setStrokeWidth] = useState(2.0);
const [markerScale, setMarkerScale] = useState(1.0);

const marker = useMemo(() => createMarkerState({
  id: 'styled-bubble-marker',
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  icon: new DefaultMarkerIcon({ fillColor: '#ef4444' }),
}), []);

useEffect(() => {
  marker.icon = new DefaultMarkerIcon({ fillColor: markerColor, scale: markerScale });
}, [marker, markerColor, markerScale]);`,
  explanation: {
    en: [
      'InfoBubble accepts bubbleColor, borderColor and borderWidth, so the bubble chrome — tail included — can be restyled without drawing it yourself.',
      'The bubble content is ordinary JSX, so the font color is just an inline style on the content element.',
      'The marker is restyled by assigning a new DefaultMarkerIcon with fillColor and scale; the map picks up the change automatically.',
    ],
    ja: [
      'InfoBubble は bubbleColor・borderColor・borderWidth を受け取るため、しっぽも含めた吹き出しの外観を自前で描かずに変更できます。',
      '吹き出しの中身は通常の JSX なので、文字色はコンテンツ要素のスタイルで指定するだけです。',
      'マーカーは fillColor と scale を指定した DefaultMarkerIcon を代入し直すだけで、地図側が自動的に反映します。',
    ],
    'es-419': [
      'InfoBubble acepta bubbleColor, borderColor y borderWidth, por lo que el marco del globo — punta incluida — puede reestilizarse sin dibujarlo manualmente.',
      'El contenido del globo es JSX normal, así que el color de la fuente es solo un estilo en el elemento de contenido.',
      'El marcador se reestiliza asignando un nuevo DefaultMarkerIcon con fillColor y scale; el mapa aplica el cambio automáticamente.',
    ],
    de: [
      'InfoBubble nimmt bubbleColor, borderColor und borderWidth entgegen, sodass sich das Aussehen der Sprechblase — Schwanz eingeschlossen — umgestalten lässt, ohne sie selbst zu zeichnen.',
      'Der Inhalt der Sprechblase ist gewöhnliches JSX, die Schriftfarbe also schlicht ein Inline-Style am Inhaltselement.',
      'Der Marker wird umgestaltet, indem ein neues DefaultMarkerIcon mit fillColor und scale zugewiesen wird; die Karte übernimmt die Änderung von selbst.',
    ],
    th: [
      'InfoBubble รับ bubbleColor, borderColor และ borderWidth จึงจัดสไตล์กรอบของบับเบิลรวมถึงหางได้โดยไม่ต้องวาดเอง',
      'เนื้อหาของบับเบิลเป็น JSX ธรรมดา สีตัวอักษรจึงเป็นเพียงสไตล์อินไลน์บนอิลิเมนต์เนื้อหา',
      'มาร์กเกอร์เปลี่ยนรูปลักษณ์ด้วยการกำหนด DefaultMarkerIcon ตัวใหม่พร้อม fillColor และ scale แผนที่จะรับการเปลี่ยนแปลงนั้นเอง',
    ],
    hi: [
      'InfoBubble bubbleColor, borderColor और borderWidth लेता है, इसलिए बबल का ढाँचा — पूँछ सहित — खुद खींचे बिना बदला जा सकता है।',
      'बबल की सामग्री सामान्य JSX है, इसलिए फ़ॉन्ट का रंग सामग्री एलिमेंट पर एक इनलाइन स्टाइल भर है।',
      'मार्कर को fillColor और scale के साथ नया DefaultMarkerIcon देकर बदला जाता है; मैप वह बदलाव अपने आप उठा लेता है।',
    ],
  },
};

export default doc;
