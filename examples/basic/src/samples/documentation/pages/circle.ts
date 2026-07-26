import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Circle state={circleState} />
  <Polyline points={[center, edge]} zIndex={1} />
  <Marker position={center} />
  <Marker position={edge} draggable onDrag={resizeCircle} />
</MapViewContainer>`,
  state: `const center = createGeoPoint({ latitude: 21.382314, longitude: -157.933097 });
const [edge, setEdge] = useState(() => calculatePositionAtDistance({
  center, distanceMeters: 1000, bearingDegrees: 90,
}));
const radiusMeters = useMemo(
  () => computeDistanceBetween(center, edge),
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
      'The edge point is React state seeded by calculatePositionAtDistance, computeDistanceBetween(center, edge) derives radiusMeters, and useMemo rebuilds the CircleState whenever that radius changes.',
      'Dragging the edge marker calls resizeCircle to move edge, while the Polyline drawn at zIndex 1 keeps the radius line above the fill and the circle grows to match.',
    ],
    ja: [
      '円を描画し、外周のマーカーをドラッグして半径を変更します。半径線は円より上に描画されます。',
      'edge は calculatePositionAtDistance で初期化した React の state で、computeDistanceBetween(center, edge) から radiusMeters を求め、半径が変わるたびに useMemo が CircleState を作り直します。',
      '外周マーカーのドラッグが resizeCircle を呼んで edge を更新し、zIndex 1 で描いた Polyline が半径線を塗りの上に保ちつつ、円がその半径に合わせて拡大します。',
    ],
    'es-419': [
      'Dibuja un círculo y cambia su radio arrastrando el marcador del borde; la línea del radio se dibuja sobre el círculo.',
      'El punto edge es estado de React iniciado con calculatePositionAtDistance, computeDistanceBetween(center, edge) obtiene radiusMeters, y useMemo reconstruye el CircleState cada vez que ese radio cambia.',
      'Arrastrar el marcador del borde llama a resizeCircle para mover edge, mientras que la Polyline dibujada con zIndex 1 mantiene la línea del radio sobre el relleno y el círculo crece en consecuencia.',
    ],
  },
};

export default doc;
