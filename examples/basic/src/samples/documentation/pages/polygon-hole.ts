import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Polygon state={polygon} />
  <Markers states={vertexMarkers} />
</MapViewContainer>`,
  state: `const [holes, setHoles] = useState<GeoPoint[][]>(initialHoles);
const polygon = useMemo(() => createPolygonState({
  id: 'area-with-holes', points: outerRing, holes,
  fillColor: 'rgba(37, 99, 235, 0.45)',
}), [holes]);
const vertexMarkers = useMemo(() => holes.flatMap((hole, holeIndex) =>
  hole.map((position, vertexIndex) => createMarkerState({
    id: \`hole-\${holeIndex}-\${vertexIndex}\`, position, draggable: true,
    onDrag: markerState => setHoles(current => current.map(
      (ring, ringIndex) => ringIndex !== holeIndex ? ring : ring.map(
        (point, pointIndex) => pointIndex === vertexIndex ? markerState.position : point,
      ),
    )),
  })),
), [holes]);`,
  explanation: {
    en: [
      'Define an outer ring and one or more inner rings to render transparent holes inside a polygon.',
      'The polygon keeps a single outerRing plus a holes array in React state, and useMemo rebuilds the PolygonState whenever a hole vertex moves.',
      'vertexMarkers is flat-mapped from every hole ring, and dragging one rewrites only that ring so the transparent cut-out reshapes in real time.',
    ],
    ja: [
      '外周リングと1つ以上の内周リングを指定し、ポリゴン内部に透明な穴を描画します。',
      'ポリゴンは1つの outerRing と holes 配列を React の state に保持し、穴の頂点が動くたびに useMemo が PolygonState を作り直します。',
      'vertexMarkers はすべての穴リングから flatMap で生成され、1つをドラッグするとそのリングだけを書き換えるため、透明な切り抜きがリアルタイムに変形します。',
    ],
    'es-419': [
      'Define un contorno exterior y uno o más contornos interiores para dibujar huecos transparentes dentro de un polígono.',
      'El polígono mantiene un único outerRing más un arreglo holes en el estado de React, y useMemo reconstruye el PolygonState cada vez que se mueve un vértice de un hueco.',
      'vertexMarkers se genera con flatMap a partir de cada anillo de hueco, y arrastrar uno reescribe solo ese anillo para que el recorte transparente se remodele en tiempo real.',
    ],
  },
};

export default doc;
