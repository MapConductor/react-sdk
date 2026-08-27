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
    de: [
      'Das einfachste MapConductor-Beispiel: ein Marker, der beim Antippen eine „Hello, MapConductor“-Sprechblase öffnet.',
      'Ein boolesches Flag liegt in useState, und das onClick des Markers setzt es auf true; onMapClick setzt es zurück, sodass sich die Sprechblase schließt, wenn Sie woanders tippen.',
      'Die InfoBubble wird nur gerendert, solange das Flag true ist, und hängt am Marker — das Grundmuster zustandsgetriebener Overlays.',
    ],
    th: [
      'ตัวอย่าง MapConductor ที่ง่ายที่สุด มีมาร์กเกอร์หนึ่งอันที่เปิดบับเบิล “Hello, MapConductor” เมื่อแตะ',
      'ค่าบูลีนเก็บอยู่ใน useState และ onClick ของมาร์กเกอร์เปลี่ยนค่าเป็น true ส่วน onMapClick รีเซ็ตกลับ บับเบิลจึงปิดเมื่อแตะที่อื่น',
      'InfoBubble จะเรนเดอร์เฉพาะตอนที่ค่าเป็น true และตรึงอยู่กับมาร์กเกอร์ ซึ่งเป็นแบบแผนหลักของโอเวอร์เลย์ที่ขับด้วยสถานะ',
    ],
    hi: [
      'MapConductor का सबसे सरल उदाहरण: एक मार्कर, जो टैप करने पर “Hello, MapConductor” का बबल खोलता है।',
      'एक बूलियन फ़्लैग useState में रहता है, और मार्कर का onClick उसे true कर देता है; onMapClick उसे वापस कर देता है, इसलिए कहीं और टैप करने पर बबल बंद हो जाता है।',
      'InfoBubble तभी रेंडर होता है जब फ़्लैग true है, और मार्कर से बँधा रहता है — स्टेट से चलने वाले ओवरले का मूल ढाँचा।',
    ],
  },
};

export default doc;
