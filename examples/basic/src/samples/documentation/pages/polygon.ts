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
  },
};

export default doc;
