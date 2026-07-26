import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {selectedMarkers.map(marker => (
    <InfoBubble key={marker.id} marker={marker}>
      {marker.extra}
    </InfoBubble>
  ))}
</MapViewContainer>`,
  state: `const [selectedMarkers, setSelectedMarkers] = useState<MarkerState[]>([]);
const markers = useMemo(() => positions.map((position, index) => createMarkerState({
  id: \`marker-\${index}\`, position,
  onClick: markerState => setSelectedMarkers(current => [...current, markerState]),
})), [positions]);
const activeMarker = selectedMarkers.at(-1) ?? null;`,
  explanation: {
    en: [
      'Keep multiple markers selected and render one independently positioned bubble for each.',
      'selectedMarkers accumulates every clicked MarkerState rather than keeping only the most recent one.',
      'Mapping over that array renders one InfoBubble per marker, each keyed by marker.id and positioned independently.',
    ],
    ja: [
      '複数のマーカーを選択状態に保ち、それぞれの位置へ独立した吹き出しを描画します。',
      'selectedMarkers は最新の1件だけでなく、クリックされた MarkerState をすべて蓄積します。',
      'その配列を map すると、marker.id を key にした InfoBubble がマーカーごとに1つずつ、独立した位置に描画されます。',
    ],
    'es-419': [
      'Mantiene varios marcadores seleccionados y dibuja un globo posicionado de forma independiente para cada uno.',
      'selectedMarkers acumula cada MarkerState tocado en lugar de conservar solo el más reciente.',
      'Recorrer ese arreglo dibuja un InfoBubble por marcador, cada uno con clave marker.id y ubicado de forma independiente.',
    ],
  },
};

export default doc;
