import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Polyline state={polylineState} />
  <Markers states={waypointMarkers} />
</MapViewContainer>`,
  state: `const [points, setPoints] = useState<GeoPoint[]>(initialPoints);
const polylineState = useMemo(() => createPolylineState({
  id: 'route', points, strokeColor: '#ef4444', strokeWidth: 4,
}), [points]);
const waypointMarkers = points.map((position, index) => createMarkerState({
  id: \`waypoint-\${index}\`, position, draggable: true,
}));`,
  explanation: {
    en: [
      'Draw a route from geographic points and expose its vertices as draggable waypoint markers.',
      'The points array is React state, and useMemo rebuilds the PolylineState — a red, 4-pixel stroke — whenever those points change.',
      'Every point is also turned into a draggable waypoint marker, so the route can be reshaped directly on the map.',
    ],
    ja: [
      '地理座標の配列から経路を描画し、頂点をドラッグ可能なウェイポイントとして表示します。',
      'points は React の state で、座標が変わるたびに useMemo が赤・線幅4pxの PolylineState を作り直します。',
      '各頂点はドラッグ可能なウェイポイントマーカーにもなるため、地図上で直接ルートを変形できます。',
    ],
    'es-419': [
      'Dibuja una ruta a partir de coordenadas geográficas y muestra sus vértices como puntos de paso arrastrables.',
      'El arreglo points es estado de React, y useMemo reconstruye el PolylineState —un trazo rojo de 4 píxeles— cada vez que esos puntos cambian.',
      'Cada punto se convierte además en un marcador de paso arrastrable, de modo que la ruta se puede remodelar directamente sobre el mapa.',
    ],
    de: [
      'Aus geografischen Punkten eine Route zeichnen und ihre Stützpunkte als ziehbare Wegpunkt-Marker anbieten.',
      'Das points-Array ist React-State, und useMemo baut den PolylineState — eine rote Kontur von 4 Pixeln — neu, sobald sich diese Punkte ändern.',
      'Jeder Punkt wird zugleich zu einem ziehbaren Wegpunkt-Marker, sodass sich die Route direkt auf der Karte umformen lässt.',
    ],
    th: [
      'วาดเส้นทางจากจุดภูมิศาสตร์ และเปิดจุดยอดของเส้นทางออกมาเป็นมาร์กเกอร์จุดผ่านที่ลากได้',
      'อาร์เรย์ points เป็นสถานะของ React และ useMemo จะสร้าง PolylineState ใหม่ทุกครั้งที่จุดเหล่านั้นเปลี่ยน โดยเป็นเส้นสีแดงหนา 4 พิกเซล',
      'ทุกจุดยังกลายเป็นมาร์กเกอร์จุดผ่านที่ลากได้ เส้นทางจึงปรับรูปได้โดยตรงบนแผนที่',
    ],
    hi: [
      'भौगोलिक बिंदुओं से एक रास्ता खींचें, और उसके शीर्षों को खींचे जा सकने वाले वेपॉइंट मार्कर के रूप में दें।',
      'points सरणी React स्टेट है, और वे बिंदु बदलते ही useMemo PolylineState दोबारा बनाता है — 4 पिक्सेल की लाल रेखा।',
      'हर बिंदु खींचे जा सकने वाला वेपॉइंट मार्कर भी बन जाता है, इसलिए रास्ता सीधे मैप पर ही बदला जा सकता है।',
    ],
  },
};

export default doc;
