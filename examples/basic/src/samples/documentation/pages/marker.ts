import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {selected && <InfoBubble marker={selected}>{selected.extra}</InfoBubble>}
</MapViewContainer>`,
  state: `const [selected, setSelected] = useState<MarkerState | null>(null);
const markers = useMemo(() => markerData.map(item => createMarkerState({
  id: item.id,
  position: createGeoPoint(item.position),
  icon: item.icon,
  onClick: markerState => setSelected(markerState),
})), [markerData]);`,
  explanation: {
    en: [
      'Compose markers with several icon sources and open a bubble when a marker is selected.',
      'The markers array is memoized from markerData, and each createMarkerState carries its own icon plus an onClick that records the selected MarkerState.',
      'The batched <Markers> renders every icon variant together, and the InfoBubble surfaces selected.extra only while a marker stays active.',
    ],
    ja: [
      '複数種類のアイコンを持つマーカーを構成し、選択されたマーカーに吹き出しを表示します。',
      'markers は markerData から useMemo で生成し、各 createMarkerState が独自の icon と、選択された MarkerState を記録する onClick を持ちます。',
      '一括描画の <Markers> が異なるアイコンをまとめて描画し、InfoBubble はマーカーが選択されている間だけ selected.extra を表示します。',
    ],
    'es-419': [
      'Compone marcadores con distintos tipos de iconos y abre un globo cuando se selecciona un marcador.',
      'El arreglo markers se memoriza a partir de markerData, y cada createMarkerState lleva su propio icon más un onClick que registra el MarkerState seleccionado.',
      'El <Markers> por lotes dibuja juntas todas las variantes de icono, y el InfoBubble muestra selected.extra solo mientras un marcador permanece activo.',
    ],
  },
};

export default doc;
