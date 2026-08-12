import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <KMLLayer state={layerState} features={features} />
  {selected && (
    <InfoBubble position={selected.position}>
      <PropertyTable properties={selected.properties} />
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const [features, setFeatures] = useState<KMLFeatureData[]>([]);
const [selected, setSelected] = useState<SelectedFeature | null>(null);
const layerState = useMemo(() => new KMLLayerState({ /* fallback style */ }), []);`,
  explanation: {
    en: [
      'Parse a KML document with KMLParser and render its placemarks — styled polygons, lines, and points — as a tiled overlay.',
      'Both the features and the selected feature live in React state, and layerState is a KMLLayerState whose style is the fallback used when a placemark carries no KML <Style>.',
      "handleMapClick resolves which feature was hit and stores it, then InfoBubble anchors a PropertyTable of the placemark's name, description, and ExtendedData at the clicked coordinate.",
    ],
    ja: [
      'KML ドキュメントを KMLParser で解析し、スタイル付きのポリゴン・ライン・ポイントをタイルオーバーレイとして描画します。',
      'features と選択中の Feature はどちらも React の state に保持し、layerState は KML の <Style> を持たないプレースマークに使う既定スタイルを持つ KMLLayerState です。',
      'handleMapClick がどの Feature に当たったかを判定して保存し、InfoBubble がプレースマークの name / description / ExtendedData の PropertyTable をクリック座標に固定します。',
    ],
    'es-419': [
      'Analiza un documento KML con KMLParser y renderiza sus placemarks — polígonos, líneas y puntos con estilo — como una superposición de mosaicos.',
      'Tanto los features como el elemento seleccionado viven en el estado de React, y layerState es un KMLLayerState cuyo estilo es el respaldo cuando un placemark no trae <Style> KML.',
      'handleMapClick determina qué elemento se tocó y lo almacena, luego InfoBubble ancla un PropertyTable con name, description y ExtendedData del placemark en la coordenada tocada.',
    ],
  },
};

export default doc;
