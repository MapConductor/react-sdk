import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
  {selected && (
    <InfoBubble marker={marker}>Simple text content</InfoBubble>
  )}
</MapViewContainer>`,
  state: `const position = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });
const [selected, setSelected] = useState(false);
const marker = useMemo(() => createMarkerState({
  id: 'place', position, onClick: () => setSelected(true),
}), [position]);`,
  explanation: {
    en: [
      'Anchor a simple React content bubble to a marker selected by the user.',
      "A boolean selected flag lives in useState, and the marker's onClick flips it to true.",
      'The InfoBubble renders only while selected is true and holds plain text, showing the minimal shape of a marker-anchored bubble.',
    ],
    ja: [
      'ユーザーが選択したマーカーに、シンプルな React コンテンツの吹き出しを固定します。',
      '真偽値の selected を useState で保持し、マーカーの onClick がそれを true にします。',
      'InfoBubble は selected が true の間だけ描画され、プレーンテキストを表示することで、マーカーに固定した吹き出しの最小構成を示します。',
    ],
    'es-419': [
      'Ancla un globo sencillo con contenido React al marcador seleccionado por el usuario.',
      'Una bandera booleana selected vive en useState, y el onClick del marcador la cambia a true.',
      'El InfoBubble se dibuja solo mientras selected es true y contiene texto plano, mostrando la forma mínima de un globo anclado a un marcador.',
    ],
    de: [
      'Eine einfache Sprechblase mit React-Inhalt an einem vom Nutzer ausgewählten Marker verankern.',
      'Ein boolesches selected-Flag liegt in useState, und das onClick des Markers setzt es auf true.',
      'Die InfoBubble wird nur gerendert, solange selected true ist, und enthält reinen Text — die kleinstmögliche Form einer am Marker verankerten Sprechblase.',
    ],
    th: [
      'ตรึงบับเบิลเนื้อหา React อย่างง่ายไว้กับมาร์กเกอร์ที่ผู้ใช้เลือก',
      'ค่าบูลีน selected เก็บอยู่ใน useState และ onClick ของมาร์กเกอร์เปลี่ยนค่าเป็น true',
      'InfoBubble เรนเดอร์เฉพาะตอนที่ selected เป็น true และมีแค่ข้อความล้วน ซึ่งเป็นรูปแบบพื้นฐานที่สุดของบับเบิลที่ตรึงกับมาร์กเกอร์',
    ],
    hi: [
      'उपयोगकर्ता के चुने हुए मार्कर से एक सादा React सामग्री वाला बबल बाँधें।',
      'एक बूलियन selected फ़्लैग useState में रहता है, और मार्कर का onClick उसे true कर देता है।',
      'InfoBubble तभी रेंडर होता है जब selected true हो, और उसमें सादा टेक्स्ट भर होता है — मार्कर से बँधे बबल का सबसे छोटा रूप।',
    ],
  },
};

export default doc;
