import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <GeoJSONLayer state={layerState} features={features} />
  {selected && (
    <InfoBubbleAtPosition position={selected.position}>
      <PropertyTable properties={selected.properties} />
    </InfoBubbleAtPosition>
  )}
</MapViewContainer>`,
  state: `const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
const [selected, setSelected] = useState<SelectedFeature | null>(null);
const layerState = useMemo(() => new GeoJSONLayerState({ id: 'railways' }), []);`,
  explanation: {
    en: [
      "Process clicks against GeoJSON features and show the selected feature's properties at the geographic click position.",
      'Both the features and the selected feature live in React state, and layerState is a GeoJSONLayerState holding the railway data.',
      'handleMapClick resolves which feature was hit and stores it, then InfoBubbleAtPosition anchors a PropertyTable of its properties at the clicked coordinate.',
    ],
    ja: [
      'GeoJSON Feature へのクリックを判定し、選択した Feature の属性をクリック地点に表示します。',
      'features と選択中の Feature はどちらも React の state に保持し、layerState は鉄道データ用の GeoJSONLayerState です。',
      'handleMapClick がどの Feature に当たったかを判定して保存し、InfoBubbleAtPosition がその属性の PropertyTable をクリック座標に固定します。',
    ],
    'es-419': [
      'Procesa clics sobre elementos GeoJSON y muestra las propiedades del elemento seleccionado en la posición geográfica del clic.',
      'Tanto los features como el elemento seleccionado viven en el estado de React, y layerState es un GeoJSONLayerState con los datos ferroviarios.',
      'handleMapClick determina qué elemento se tocó y lo almacena, luego InfoBubbleAtPosition ancla un PropertyTable de sus propiedades en la coordenada tocada.',
    ],
  },
};

export default doc;
