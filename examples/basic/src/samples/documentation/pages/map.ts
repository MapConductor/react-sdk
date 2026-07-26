import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={clearSelection}>
  <Markers states={storeMarkers} />
  {selectedMarker && (
    <InfoBubble marker={selectedMarker}>
      <StoreInfoView store={selectedMarker.extra} />
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
const storeMarkers = useMemo(() => stores.map(store => createMarkerState({
  id: store.id,
  position: createGeoPoint({ latitude: store.lat, longitude: store.lng }),
  extra: store,
  onClick: markerState => setSelectedMarker(markerState),
})), [stores]);
const clearSelection = () => setSelectedMarker(null);`,
  explanation: {
    en: [
      'Render a collection of store markers in one composition and show an information bubble for the selected store.',
      'The storeMarkers array is built once with useMemo: each createMarkerState keeps its store record in the extra field and an onClick handler that saves the tapped MarkerState, while onMapClick clears the selection.',
      'The batched <Markers> component draws every store in a single pass, and the InfoBubble is anchored to the selected marker so StoreInfoView appears only while a store is chosen.',
    ],
    ja: [
      '店舗マーカーを一括で描画し、選択された店舗に情報を表示する吹き出しを重ねます。',
      'storeMarkers は useMemo で一度だけ生成し、各 createMarkerState は店舗データを extra に保持して、タップされた MarkerState を保存する onClick を持ちます。地図の余白をクリックすると選択が解除されます。',
      '一括描画用の <Markers> が全店舗を1回で描画し、InfoBubble は選択中のマーカーに固定されるため、店舗を選んだ間だけ StoreInfoView が表示されます。',
    ],
    'es-419': [
      'Dibuja una colección de marcadores de tiendas en una sola composición y muestra un globo de información para la tienda seleccionada.',
      'El arreglo storeMarkers se crea una vez con useMemo: cada createMarkerState guarda su registro de tienda en el campo extra y un onClick que almacena el MarkerState tocado, mientras que onMapClick borra la selección.',
      'El componente por lotes <Markers> dibuja todas las tiendas de una sola vez y el InfoBubble se ancla al marcador seleccionado, por lo que StoreInfoView aparece solo mientras hay una tienda elegida.',
    ],
  },
};

export default doc;
