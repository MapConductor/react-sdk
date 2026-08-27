import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Circle state={circleState} />
  <Polyline points={[center, edge]} zIndex={1} />
  <Marker position={center} />
  <Marker position={edge} draggable onDrag={resizeCircle} />
</MapViewContainer>`,
  state: `const center = createGeoPoint({ latitude: 21.382314, longitude: -157.933097 });
const [edge, setEdge] = useState(() => Spherical.computeOffset({
  origin: center, distance: 1000, heading: 90,
}));
const radiusMeters = useMemo(
  () => Spherical.computeDistanceBetween(center, edge),
  [edge],
);
const circleState = useMemo(() => createCircleState({
  id: 'circle', center, radiusMeters,
  fillColor: 'rgba(37, 99, 235, 0.3)',
}), [radiusMeters]);
const resizeCircle = (markerState: MarkerState) => setEdge(markerState.position);`,
  explanation: {
    en: [
      'Draw a circle and resize its radius by dragging the edge marker; the radius line is ordered above the circle.',
      'The edge point is React state seeded by Spherical.computeOffset, Spherical.computeDistanceBetween(center, edge) derives radiusMeters, and useMemo rebuilds the CircleState whenever that radius changes.',
      'Dragging the edge marker calls resizeCircle to move edge, while the Polyline drawn at zIndex 1 keeps the radius line above the fill and the circle grows to match.',
    ],
    ja: [
      '円を描画し、外周のマーカーをドラッグして半径を変更します。半径線は円より上に描画されます。',
      'edge は Spherical.computeOffset で初期化した React の state で、Spherical.computeDistanceBetween(center, edge) から radiusMeters を求め、半径が変わるたびに useMemo が CircleState を作り直します。',
      '外周マーカーのドラッグが resizeCircle を呼んで edge を更新し、zIndex 1 で描いた Polyline が半径線を塗りの上に保ちつつ、円がその半径に合わせて拡大します。',
    ],
    'es-419': [
      'Dibuja un círculo y cambia su radio arrastrando el marcador del borde; la línea del radio se dibuja sobre el círculo.',
      'El punto edge es estado de React iniciado con Spherical.computeOffset, Spherical.computeDistanceBetween(center, edge) obtiene radiusMeters, y useMemo reconstruye el CircleState cada vez que ese radio cambia.',
      'Arrastrar el marcador del borde llama a resizeCircle para mover edge, mientras que la Polyline dibujada con zIndex 1 mantiene la línea del radio sobre el relleno y el círculo crece en consecuencia.',
    ],
    de: [
      'Einen Kreis zeichnen und seinen Radius durch Ziehen des Rand-Markers ändern; die Radiuslinie liegt über dem Kreis.',
      'Der Randpunkt ist React-State, den Spherical.computeOffset vorbelegt, Spherical.computeDistanceBetween(center, edge) leitet radiusMeters ab, und useMemo baut den CircleState neu, sobald sich dieser Radius ändert.',
      'Das Ziehen des Rand-Markers ruft resizeCircle auf, um edge zu verschieben, während die auf zIndex 1 gezeichnete Polyline die Radiuslinie über der Füllung hält und der Kreis entsprechend mitwächst.',
    ],
    th: [
      'วาดวงกลมและปรับรัศมีด้วยการลากมาร์กเกอร์ที่ขอบ โดยเส้นรัศมีถูกจัดให้อยู่เหนือวงกลม',
      'จุดที่ขอบเป็นสถานะของ React ซึ่งตั้งค่าเริ่มต้นด้วย Spherical.computeOffset ส่วน Spherical.computeDistanceBetween(center, edge) ใช้หา radiusMeters และ useMemo จะสร้าง CircleState ใหม่ทุกครั้งที่รัศมีเปลี่ยน',
      'การลากมาร์กเกอร์ที่ขอบเรียก resizeCircle เพื่อย้าย edge ขณะที่ Polyline ซึ่งวาดที่ zIndex 1 ทำให้เส้นรัศมีอยู่เหนือสีเติม และวงกลมก็ขยายตามไปด้วย',
    ],
    hi: [
      'एक वृत्त खींचें और किनारे का मार्कर खींचकर उसकी त्रिज्या बदलें; त्रिज्या की रेखा वृत्त के ऊपर रखी जाती है।',
      'किनारे का बिंदु React स्टेट है, जिसे Spherical.computeOffset से भरा जाता है; Spherical.computeDistanceBetween(center, edge) से radiusMeters निकलता है, और वह त्रिज्या बदलते ही useMemo CircleState दोबारा बना देता है।',
      'किनारे का मार्कर खींचने पर resizeCircle edge को हिलाता है, जबकि zIndex 1 पर खींची गई Polyline त्रिज्या की रेखा को भराव के ऊपर रखती है और वृत्त उसी के साथ बढ़ता है।',
    ],
  },
};

export default doc;
