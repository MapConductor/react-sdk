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
const layerState = useMemo(() => new KMLLayerState({ /* fallback style */ }), []);

// Fetch the document (here: public/sample.kml) and parse it into features.
useEffect(() => {
  fetch('/sample.kml')
    .then(response => response.text())
    .then(text => setFeatures(KMLParser.parse(text)));
}, []);`,
  explanation: {
    en: [
      'Parse a KML document with KMLParser and render its placemarks — styled polygons, lines, and points — as a tiled overlay.',
      'KMLParser.parse takes the KML text, so fetch the document yourself first; KMLLoader.load takes a URL instead (anything fetch accepts — a same-origin path such as /sample.kml or an absolute https URL), follows <NetworkLink> references and unpacks KMZ archives. On the web that fetch is subject to CORS, so a cross-origin document loads only when its server sends Access-Control-Allow-Origin — otherwise serve it from your own origin or inject a proxying fetch through the KMLLoader constructor.',
      'Both the features and the selected feature live in React state, and layerState is a KMLLayerState whose style is the fallback used when a placemark carries no KML <Style>.',
      "handleMapClick resolves which feature was hit and stores it, then InfoBubble anchors a PropertyTable of the placemark's name, description, and ExtendedData at the clicked coordinate.",
    ],
    ja: [
      'KML ドキュメントを KMLParser で解析し、スタイル付きのポリゴン・ライン・ポイントをタイルオーバーレイとして描画します。',
      'KMLParser.parse は KML テキストを受け取るので取得は自前で行います。KMLLoader.load なら URL を渡せます（fetch が引けるもの、例えば同一オリジンの /sample.kml や絶対 https URL）。こちらは <NetworkLink> の参照先も追跡し、KMZ も展開します。ただし web の取得は CORS の制約を受けるため、別オリジンの文書は配信側が Access-Control-Allow-Origin を返す場合にのみ読めます。返らない場合は自分のオリジンに置くか、KMLLoader の constructor で fetch を差し替えてプロキシ経由にしてください。',
      'features と選択中の Feature はどちらも React の state に保持し、layerState は KML の <Style> を持たないプレースマークに使う既定スタイルを持つ KMLLayerState です。',
      'handleMapClick がどの Feature に当たったかを判定して保存し、InfoBubble がプレースマークの name / description / ExtendedData の PropertyTable をクリック座標に固定します。',
    ],
    'es-419': [
      'Analiza un documento KML con KMLParser y renderiza sus placemarks — polígonos, líneas y puntos con estilo — como una superposición de mosaicos.',
      'KMLParser.parse recibe el texto KML, así que tú haces la descarga; KMLLoader.load recibe una URL (cualquiera que acepte fetch: una ruta del mismo origen como /sample.kml o una URL https absoluta), sigue las referencias <NetworkLink> y descomprime archivos KMZ. En la web esa descarga está sujeta a CORS: un documento de otro origen solo carga si su servidor envía Access-Control-Allow-Origin; si no, publícalo en tu propio origen o inyecta un fetch con proxy en el constructor de KMLLoader.',
      'Tanto los features como el elemento seleccionado viven en el estado de React, y layerState es un KMLLayerState cuyo estilo es el respaldo cuando un placemark no trae <Style> KML.',
      'handleMapClick determina qué elemento se tocó y lo almacena, luego InfoBubble ancla un PropertyTable con name, description y ExtendedData del placemark en la coordenada tocada.',
    ],
  },
};

export default doc;
