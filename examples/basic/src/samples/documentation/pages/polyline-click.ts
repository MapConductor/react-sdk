import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Polyline state={polyline} />
  <Polyline state={straightPolyline} />
  <Markers states={clickMarkers} />
</MapViewContainer>`,
  state: `const [clickMarkers, setClickMarkers] = useState<MarkerState[]>([]);
const points = useMemo(() => [haneda, sanFrancisco, honolulu], []);
const polyline = useMemo(() => createPolylineState({
  id: 'route', points, geodesic: true, strokeColor: '#ff0000', strokeWidth: 4,
  onClick: event => setClickMarkers(current => [
    ...current,
    createMarkerState({
      id: \`click-\${current.length}\`,
      position: event.clicked,
      animation: MarkerAnimation.Drop,
      icon: new ColorDefaultIcon({ fillColor: event.state.strokeColor }),
      clickable: false,
    }),
  ]),
}), [points]);
const straightPolyline = useMemo(() => polyline.copy({
  id: 'straight', geodesic: false, strokeColor: '#0000ff',
}), [polyline]);`,
  explanation: {
    en: [
      'Tap the geodesic polyline to drop a marker at the tapped position, and compare it with a straight copy of the same route.',
      "The red polyline is geodesic; its onClick appends a Drop-animated marker at event.clicked — tinted with the line's own strokeColor — into clickMarkers.",
      'straightPolyline is a .copy with geodesic:false and a blue stroke, so the geodesic (red) and straight (blue) paths between the same three points sit side by side for comparison.',
    ],
    ja: [
      '測地線のポリラインをタップすると、その位置にマーカーが追加され、同じ経路の直線版と見比べられます。',
      '赤いポリラインは測地線で、その onClick が event.clicked の位置に、線の strokeColor と同じ色で Drop アニメーション付きのマーカーを clickMarkers へ追加します。',
      'straightPolyline は geodesic:false・青い線の .copy なので、同じ3点を結ぶ測地線（赤）と直線（青）を並べて比較できます。',
    ],
    'es-419': [
      'Toca la polilínea geodésica para colocar un marcador en el punto tocado y compárala con una copia recta de la misma ruta.',
      'La polilínea roja es geodésica; su onClick agrega a clickMarkers un marcador con animación Drop en event.clicked, teñido con el propio strokeColor de la línea.',
      'straightPolyline es una .copy con geodesic:false y trazo azul, de modo que las rutas geodésica (roja) y recta (azul) entre los mismos tres puntos quedan lado a lado para comparar.',
    ],
    de: [
      'Auf die geodätische Polylinie tippen, um an der getippten Stelle einen Marker abzusetzen, und sie mit einer geraden Kopie derselben Route vergleichen.',
      'Die rote Polylinie ist geodätisch; ihr onClick hängt an event.clicked einen Marker mit Drop-Animation — eingefärbt in der strokeColor der Linie selbst — an clickMarkers an.',
      'straightPolyline ist eine .copy mit geodesic:false und blauer Kontur, sodass der geodätische (rote) und der gerade (blaue) Weg zwischen denselben drei Punkten zum Vergleich nebeneinanderliegen.',
    ],
    th: [
      'แตะโพลีไลน์แบบจีโอเดสิกเพื่อวางมาร์กเกอร์ที่ตำแหน่งที่แตะ แล้วเทียบกับสำเนาแบบเส้นตรงของเส้นทางเดียวกัน',
      'โพลีไลน์สีแดงเป็นแบบจีโอเดสิก โดย onClick ของมันจะเพิ่มมาร์กเกอร์ที่มีแอนิเมชัน Drop ลงใน clickMarkers ที่ event.clicked และย้อมด้วย strokeColor ของเส้นนั้นเอง',
      'straightPolyline คือ .copy ที่ตั้ง geodesic:false และใช้เส้นสีน้ำเงิน เส้นทางแบบจีโอเดสิก (แดง) กับแบบตรง (น้ำเงิน) ระหว่างสามจุดเดียวกันจึงวางเทียบกันได้',
    ],
    hi: [
      'जियोडेसिक पॉलीलाइन पर टैप करके उसी जगह मार्कर रखें, और उसी रास्ते की सीधी नकल से तुलना करें।',
      'लाल पॉलीलाइन जियोडेसिक है; उसका onClick event.clicked पर Drop एनिमेशन वाला एक मार्कर clickMarkers में जोड़ देता है — रंग उसी रेखा के strokeColor का।',
      'straightPolyline उसकी .copy है, geodesic:false और नीली रेखा के साथ, ताकि उन्हीं तीन बिंदुओं के बीच जियोडेसिक (लाल) और सीधा (नीला) रास्ता आमने-सामने तुलना के लिए रहें।',
    ],
  },
};

export default doc;
