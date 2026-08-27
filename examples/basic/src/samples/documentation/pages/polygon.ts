import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Polygon state={polygonState} />
  <Markers states={vertexMarkers} />
</MapViewContainer>`,
  state: `const [vertices, setVertices] = useState<GeoPoint[]>(initialVertices);
const polygonState = useMemo(() => createPolygonState({
  id: 'area',
  points: vertices,
  fillColor: 'rgba(37, 99, 235, 0.3)',
  strokeColor: '#2563eb',
}), [vertices]);
const vertexMarkers = vertices.map((position, index) => createMarkerState({
  id: \`vertex-\${index}\`, position, draggable: true,
}));`,
  explanation: {
    en: [
      'Render a filled polygon and use markers to make each vertex visible and interactive.',
      'The vertices array is React state, and useMemo rebuilds the PolygonState — a translucent blue fill with a solid stroke — whenever a vertex moves.',
      'Each vertex is drawn as a draggable marker, so the polygon outline can be edited point by point.',
    ],
    ja: [
      '塗りつぶしたポリゴンを描画し、各頂点をマーカーとして見える形で操作可能にします。',
      'vertices は React の state で、頂点が動くたびに useMemo が半透明の青い塗りと実線の枠を持つ PolygonState を作り直します。',
      '各頂点はドラッグ可能なマーカーとして描かれるため、ポリゴンの輪郭を頂点ごとに編集できます。',
    ],
    'es-419': [
      'Dibuja un polígono relleno y usa marcadores para que cada vértice sea visible e interactivo.',
      'El arreglo vertices es estado de React, y useMemo reconstruye el PolygonState —un relleno azul translúcido con un trazo sólido— cada vez que un vértice se mueve.',
      'Cada vértice se dibuja como un marcador arrastrable, de modo que el contorno del polígono se puede editar punto por punto.',
    ],
    de: [
      'Ein gefülltes Polygon zeichnen und mit Markern jeden Eckpunkt sichtbar und bedienbar machen.',
      'Das vertices-Array ist React-State, und useMemo baut den PolygonState — eine durchscheinende blaue Füllung mit durchgezogener Kontur — neu, sobald sich ein Eckpunkt bewegt.',
      'Jeder Eckpunkt wird als ziehbarer Marker gezeichnet, sodass sich der Polygonumriss Punkt für Punkt bearbeiten lässt.',
    ],
    th: [
      'วาดโพลีกอนแบบมีสีเติม และใช้มาร์กเกอร์ทำให้จุดยอดแต่ละจุดมองเห็นและโต้ตอบได้',
      'อาร์เรย์ vertices เป็นสถานะของ React และ useMemo จะสร้าง PolygonState ใหม่ทุกครั้งที่จุดยอดขยับ โดยเป็นสีเติมน้ำเงินโปร่งแสงพร้อมเส้นขอบทึบ',
      'จุดยอดแต่ละจุดวาดเป็นมาร์กเกอร์ที่ลากได้ เส้นขอบของโพลีกอนจึงแก้ไขได้ทีละจุด',
    ],
    hi: [
      'भरा हुआ पॉलीगॉन खींचें, और मार्कर से हर शीर्ष को दिखने और छूने लायक बनाएँ।',
      'vertices सरणी React स्टेट है, और कोई शीर्ष हिलते ही useMemo PolygonState दोबारा बनाता है — हल्का नीला भराव और ठोस रेखा।',
      'हर शीर्ष खींचे जा सकने वाले मार्कर के रूप में बनता है, इसलिए पॉलीगॉन की रूपरेखा एक-एक बिंदु करके बदली जा सकती है।',
    ],
  },
};

export default doc;
