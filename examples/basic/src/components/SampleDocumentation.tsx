import type { SupportedLanguage } from '../sampleRegistry';
import { getSampleDocumentation } from '../sampleDocumentation';
import { Highlight, themes } from 'prism-react-renderer';

export function SampleDocumentation({
  page,
  provider,
  language,
}: {
  page: string;
  provider: string;
  language: SupportedLanguage;
}) {
  const documentation = getSampleDocumentation(page, provider);
  const providerView = provider === 'leaflet'
    ? 'LeafletMapView'
    : provider === 'mapbox'
      ? 'MapboxView'
    : provider === 'google-maps-3d'
      ? 'GoogleMapView'
      : provider === 'google-maps'
        ? 'GoogleMapView2D'
        : provider === 'arcgis'
          ? 'ArcGISMapView2D'
          : provider === 'arcgis-3d'
            ? 'ArcGISMapView'
            : 'MapLibreView';
  const providerHook = provider === 'leaflet'
    ? 'useLeafletMapViewState'
    : provider === 'mapbox'
      ? 'useMapboxViewState'
    : provider === 'google-maps' || provider === 'google-maps-3d'
      ? 'useGoogleMapViewState'
      : provider === 'arcgis' || provider === 'arcgis-3d'
        ? 'useArcGISViewState'
        : 'useMapLibreViewState';
  const stateExplanation = (() => {
    if (['marker', 'marker-animation', 'post-office', 'post-office-cluster', 'map'].includes(page)) {
      return language === 'ja'
        ? 'MarkerStateは、位置、アイコン、クリック処理など「1つのマーカーのデータ」を保持します。<Marker>はそのStateを地図へ登録し、大量のマーカーでは<Markers>へ配列を渡します。'
        : 'MarkerState holds the data for one marker, such as its position, icon, and click handler. <Marker> registers one state with the map, while <Markers> accepts an array for larger collections.';
    }
    if (['circle', 'polyline', 'polyline-click', 'polygon', 'polygon-click', 'polygon-geodesic', 'polygon-hole'].includes(page)) {
      return language === 'ja'
        ? 'CircleState、PolylineState、PolygonStateは、座標、色、線幅など図形のデータを保持します。createCircleStateなどで作成し、ReactのuseStateが変わったときはuseMemoで新しいStateを作ると、図形コンポーネントが差分を地図へ反映します。'
        : 'CircleState, PolylineState, and PolygonState hold coordinates, colors, and stroke properties. Create them with functions such as createCircleState; when React state changes, useMemo creates the updated object and the shape component applies the difference to the map.';
    }
    if (['ground-image', 'raster-layer', 'geojson-basic', 'geojson-layer', 'heatmap-layer'].includes(page)) {
      return language === 'ja'
        ? 'レイヤーStateは、地図へ重ねるデータと表示設定をまとめたオブジェクトです。Reactコンポーネントのstateプロパティへ渡すと、MapConductorが追加・更新・削除を各Providerへ伝えます。'
        : 'A layer state groups the overlay data and its display settings. Passing it to the React component through the state prop lets MapConductor forward additions, updates, and removals to the selected provider.';
    }
    if (page.startsWith('info-bubble')) {
      return language === 'ja'
        ? '選択中のMarkerStateをReactのuseStateに保存します。値がnullでないときだけInfoBubbleをJSXで描画するため、マーカーを選んだときに吹き出しが表示されます。'
        : 'The selected MarkerState is stored with React useState. JSX renders InfoBubble only while that value is not null, so selecting a marker makes its bubble appear.';
    }
    return language === 'ja'
      ? 'useStateは画面内で変化する値を保持し、useMemoは依存する値が変わったときだけStateオブジェクトを作り直します。これによりReactの再描画と地図SDKの更新を結び付けられます。'
      : 'useState stores values that change on screen, and useMemo recreates state objects only when their dependencies change. This connects React rendering to updates in the map SDK.';
  })();
  return (
    <article className="sample-documentation">
      <h2>{language === 'ja' ? 'コード例' : 'Code example'}</h2>
      <Highlight theme={themes.nightOwl} code={documentation.code} language="tsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} sample-code`} style={style}>
            <code>
              {tokens.map((line, lineIndex) => (
                <span key={lineIndex} {...getLineProps({ line })} className="sample-code-line">
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      <h3>{language === 'ja' ? 'コードの読み方' : 'How the code works'}</h3>
      <p>{documentation.explanation[language]}</p>
      <p>
        {page === 'camera-sync'
          ? language === 'ja'
            ? 'このページだけは2種類のProviderを同時に使います。useMapLibreViewStateとuseLeafletMapViewStateが別々のmapViewStateを作り、一方のカメライベントをもう一方へ渡して同期します。'
            : 'This page intentionally uses two providers. useMapLibreViewState and useLeafletMapViewState create separate map view states, and each camera event is forwarded to the other state.'
          : language === 'ja'
            ? `${providerHook}のようなHookは、Reactコンポーネントの先頭で呼び出します。返されたmapViewStateはカメラ位置や地図デザインを保持し、<${providerView} state={mapViewState}>へ渡すことで地図本体と接続されます。`
            : `A provider Hook creates mapViewState near the top of the React component. That object keeps the camera position and map design, and passing it to <${providerView} state={mapViewState}> connects it to the rendered map.`}
      </p>
      <p>{stateExplanation}</p>
      <p>
        {language === 'ja'
          ? '山括弧で書かれた部分はJSXです。state={...}のような属性をpropsと呼び、ReactコンポーネントへStateを渡します。useStateの更新が起きるとReactがもう一度JSXを評価し、画面と地図が更新されます。'
          : 'The angle-bracket syntax is JSX. Attributes such as state={...} are props that pass a state object to a React component. Updating useState makes React evaluate the JSX again, which updates both the page and the map.'}
      </p>
    </article>
  );
}
