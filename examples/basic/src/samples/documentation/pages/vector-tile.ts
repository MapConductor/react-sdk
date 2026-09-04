import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <VectorTileLayer style={style} opacity={opacity} />
</MapViewContainer>`,
  state: `const [palette, setPalette] = useState({
  water: '#3a7ca5',
  land: '#f2efe6',
  street: '#ffffff',
  building: '#d9d0c9',
});
// recolour() mixes each layer's own colour toward the picked one,
// keyed on the Shortbread source layer it draws.
const style = useMemo(
  () => recolour(baseStyle, palette, strength),
  [baseStyle, palette, strength],
);`,
  explanation: {
    en: [
      'Draws a MapLibre vector style on any backend by rasterising it in the browser and serving the result as ordinary raster tiles.',
      'The backend never sees a vector style, which is what makes this work on Google Maps, MapKit, Cesium and the rest — none of them can read one.',
      'Changing a colour replaces the style and re-rasterises the vector tiles already in memory. Nothing is fetched again: the geometry did not change, only the paint applied to it. Symbol layers are not drawn, because placing labels without collisions needs to see neighbouring tiles.',
    ],
    ja: [
      'ブラウザ上でMapLibreのベクタースタイルをラスタライズし、通常のラスタータイルとして配信することで、どのバックエンドでもベクタースタイルを描画します。',
      'バックエンドはベクタースタイルを一切見ません。だからこそ、それを読めないGoogle Maps・MapKit・Cesiumなどでも動作します。',
      '色を変更するとスタイルを差し替え、すでにメモリ上にあるベクタータイルを再ラスタライズします。ジオメトリは変わらず塗りだけが変わるため、再取得は発生しません。ラベルの衝突判定には隣接タイルを見る必要があるため、シンボルレイヤーは描画されません。',
    ],
    'es-419': [
      'Dibuja un estilo vectorial de MapLibre en cualquier backend rasterizándolo en el navegador y sirviéndolo como teselas ráster comunes.',
      'El backend nunca ve un estilo vectorial, y por eso esto funciona en Google Maps, MapKit, Cesium y los demás, que no pueden leerlo.',
      'Cambiar un color reemplaza el estilo y vuelve a rasterizar las teselas vectoriales que ya están en memoria. No se descarga nada de nuevo: la geometría no cambió, solo el pintado. Las capas de símbolos no se dibujan, porque colocar etiquetas sin colisiones exige ver las teselas vecinas.',
    ],
    de: [
      'Zeichnet einen MapLibre-Vektorstil auf jedem Backend, indem er im Browser gerastert und als gewöhnliche Rasterkacheln ausgeliefert wird.',
      'Das Backend sieht nie einen Vektorstil — deshalb funktioniert das auch mit Google Maps, MapKit, Cesium und allen anderen, die keinen lesen können.',
      'Eine Farbänderung ersetzt den Stil und rastert die bereits geladenen Vektorkacheln neu. Nichts wird erneut geladen: die Geometrie blieb gleich, nur die Farbgebung änderte sich. Symbolebenen werden nicht gezeichnet, da kollisionsfreie Beschriftung die Nachbarkacheln kennen müsste.',
    ],
    th: [
      'วาดสไตล์เวกเตอร์ของ MapLibre บนแบ็กเอนด์ใดก็ได้ โดยแรสเตอร์ในเบราว์เซอร์แล้วส่งออกเป็นไทล์ราสเตอร์ธรรมดา',
      'แบ็กเอนด์ไม่เคยเห็นสไตล์เวกเตอร์เลย จึงใช้งานได้กับ Google Maps, MapKit, Cesium และตัวอื่นที่อ่านสไตล์เวกเตอร์ไม่ได้',
      'การเปลี่ยนสีจะแทนที่สไตล์และแรสเตอร์เวกเตอร์ไทล์ที่มีอยู่ในหน่วยความจำใหม่ ไม่มีการดาวน์โหลดซ้ำ เพราะเรขาคณิตไม่เปลี่ยน เปลี่ยนแค่สีที่ทาลงไป เลเยอร์สัญลักษณ์จะไม่ถูกวาด เพราะการวางป้ายโดยไม่ชนกันต้องมองเห็นไทล์ข้างเคียง',
    ],
    hi: [
      'ब्राउज़र में रैस्टराइज़ करके और परिणाम को सामान्य रास्टर टाइलों के रूप में परोसकर किसी भी बैकएंड पर MapLibre वेक्टर स्टाइल बनाता है।',
      'बैकएंड कभी वेक्टर स्टाइल नहीं देखता — इसीलिए यह Google Maps, MapKit, Cesium और उन सभी पर काम करता है जो उसे पढ़ नहीं सकते।',
      'रंग बदलने पर स्टाइल बदल जाती है और मेमोरी में मौजूद वेक्टर टाइलें दोबारा रैस्टराइज़ होती हैं। कुछ भी दोबारा नहीं लाया जाता: ज्यामिति वही रही, केवल रंग बदला। सिंबल लेयर नहीं बनाई जातीं, क्योंकि बिना टकराव के लेबल रखने के लिए पड़ोसी टाइलें देखनी पड़ती हैं।',
    ],
  },
};

export default doc;
