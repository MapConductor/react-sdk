import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <GroundImage state={groundImageState} />
  <Markers states={cornerMarkers} />
</MapViewContainer>`,
  state: `const [groundImageState] = useState(() => createGroundImageState({
  id: 'historic-map', imageUrl, bounds: initialBounds, opacity: 0.7,
}));

const moveSouthWest = (markerState: MarkerState) => {
  groundImageState.bounds = createGeoRectBounds({
    southWest: markerState.position,
    northEast: groundImageState.bounds.northEast,
  });
};

const southWestMarker = createMarkerState({
  id: 'south-west', position: groundImageState.bounds.southWest!,
  draggable: true, onDrag: moveSouthWest, onDragEnd: moveSouthWest,
});
const cornerMarkers = [southWestMarker, northEastMarker];`,
  explanation: {
    en: [
      'Keep one GroundImageState instance and update its bounds from the draggable corner markers.',
      'A single GroundImageState is created with useState and never replaced; dragging a corner calls moveSouthWest, which assigns a fresh createGeoRectBounds to groundImageState.bounds.',
      'Because the state is observable, every bounds assignment is pushed to the map provider, so the overlaid image stretches to follow the corner markers.',
    ],
    ja: [
      'GroundImageState は1つのインスタンスを保持し、ドラッグできる隅のマーカーから bounds を更新します。',
      'GroundImageState は useState で1つだけ生成して差し替えず、隅をドラッグすると moveSouthWest が新しい createGeoRectBounds を groundImageState.bounds へ代入します。',
      'state は Observable なので、bounds の代入ごとに地図プロバイダーへ伝わり、重ねた画像が隅のマーカーに追従して伸縮します。',
    ],
    'es-419': [
      'Conserva una instancia de GroundImageState y actualiza sus límites desde marcadores de esquina arrastrables.',
      'Se crea un único GroundImageState con useState y nunca se reemplaza; arrastrar una esquina llama a moveSouthWest, que asigna un createGeoRectBounds nuevo a groundImageState.bounds.',
      'Como el estado es observable, cada asignación de límites se envía al proveedor del mapa, por lo que la imagen superpuesta se estira para seguir a los marcadores de esquina.',
    ],
  },
};

export default doc;
