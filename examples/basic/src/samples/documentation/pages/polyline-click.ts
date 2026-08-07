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
  },
};

export default doc;
