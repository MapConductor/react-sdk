import type { SupportedLanguage } from '../sampleRegistry';
import { getSampleDocumentation } from '../sampleDocumentation';
import { Highlight, themes } from 'prism-react-renderer';
import { translate } from '../i18n';

export function SampleDocumentation({
  page,
  provider,
  language,
}: {
  page: string;
  provider: string;
  language: SupportedLanguage;
}) {
  const documentation = getSampleDocumentation(page, provider, language);
  const providerView = provider === 'leaflet'
    ? 'LeafletMapView'
    : provider === 'mapbox'
      ? 'MapBoxMapView2D'
    : provider === 'mapbox-3d'
      ? 'MapBoxMapView'
    : provider === 'google-maps-3d'
      ? 'GoogleMapView'
      : provider === 'google-maps'
        ? 'GoogleMapView2D'
        : provider === 'arcgis'
          ? 'ArcGISMapView2D'
          : provider === 'arcgis-3d'
            ? 'ArcGISMapView'
            : provider === 'maplibre-3d'
              ? 'MapLibreMapView'
            : provider === 'openlayers'
              ? 'OpenLayersMapView'
            : provider === 'cesium'
              ? 'CesiumMapView'
            : provider === 'here'
              ? 'HereMapView2D'
              : 'MapLibreMapView2D';
  const providerHook = provider === 'leaflet'
    ? 'useLeafletMapViewState'
    : provider === 'mapbox'
      ? 'useMapboxViewState'
    : provider === 'google-maps' || provider === 'google-maps-3d'
      ? 'useGoogleMapViewState'
      : provider === 'arcgis' || provider === 'arcgis-3d'
        ? 'useArcGISViewState'
      : provider === 'openlayers'
        ? 'useOpenLayersMapViewState'
      : provider === 'cesium'
        ? 'useCesiumMapViewState'
      : provider === 'here'
        ? 'useHereViewState'
        : 'useMapLibreViewState';
  const stateExplanation = (() => {
    if (['marker', 'marker-animation', 'post-office', 'post-office-cluster', 'map'].includes(page)) {
      return translate(language,
        'MarkerState holds the data for one marker, such as its position, icon, and click handler. <Marker> registers one state with the map, while <Markers> accepts an array for larger collections.',
        'MarkerStateは、位置、アイコン、クリック処理など「1つのマーカーのデータ」を保持します。<Marker>はそのStateを地図へ登録し、大量のマーカーでは<Markers>へ配列を渡します。',
        'MarkerState guarda los datos de un marcador, como su posición, icono y evento de clic. <Marker> registra un estado y <Markers> recibe un arreglo para colecciones grandes.');
    }
    if (['circle', 'polyline', 'polyline-click', 'polygon', 'polygon-click', 'polygon-geodesic', 'polygon-hole'].includes(page)) {
      return translate(language,
        'CircleState, PolylineState, and PolygonState hold coordinates, colors, and stroke properties. Create them with functions such as createCircleState; when React state changes, useMemo creates the updated object and the shape component applies the difference to the map.',
        'CircleState、PolylineState、PolygonStateは、座標、色、線幅など図形のデータを保持します。createCircleStateなどで作成し、ReactのuseStateが変わったときはuseMemoで新しいStateを作ると、図形コンポーネントが差分を地図へ反映します。',
        'CircleState, PolylineState y PolygonState guardan coordenadas, colores y propiedades del trazo. useMemo vuelve a crear el objeto cuando cambia el estado de React y el componente aplica la diferencia al mapa.');
    }
    if (['ground-image', 'raster-layer', 'geojson-basic', 'geojson-layer', 'heatmap-layer'].includes(page)) {
      return translate(language,
        'A layer state groups the overlay data and its display settings. Passing it to the React component through the state prop lets MapConductor forward additions, updates, and removals to the selected provider.',
        'レイヤーStateは、地図へ重ねるデータと表示設定をまとめたオブジェクトです。Reactコンポーネントのstateプロパティへ渡すと、MapConductorが追加・更新・削除を各Providerへ伝えます。',
        'El estado de una capa agrupa los datos superpuestos y su configuración visual. Al pasarlo mediante la prop state, MapConductor comunica las altas, cambios y bajas al proveedor seleccionado.');
    }
    if (page.startsWith('info-bubble')) {
      return translate(language,
        'The selected MarkerState is stored with React useState. JSX renders InfoBubble only while that value is not null, so selecting a marker makes its bubble appear.',
        '選択中のMarkerStateをReactのuseStateに保存します。値がnullでないときだけInfoBubbleをJSXで描画するため、マーカーを選んだときに吹き出しが表示されます。',
        'El MarkerState seleccionado se guarda con useState. JSX solo dibuja InfoBubble cuando el valor no es null, por lo que el globo aparece al seleccionar el marcador.');
    }
    return translate(language,
      'useState stores values that change on screen, and useMemo recreates state objects only when their dependencies change. This connects React rendering to updates in the map SDK.',
      'useStateは画面内で変化する値を保持し、useMemoは依存する値が変わったときだけStateオブジェクトを作り直します。これによりReactの再描画と地図SDKの更新を結び付けられます。',
      'useState guarda los valores que cambian en pantalla y useMemo vuelve a crear objetos de estado solo cuando cambian sus dependencias. Así se conectan el renderizado de React y las actualizaciones del SDK de mapas.');
  })();
  return (
    <article className="sample-documentation">
      <h2>{translate(language, 'Code example', 'コード例', 'Ejemplo de código')}</h2>
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
      <h3>{translate(language, 'How the code works', 'コードの読み方', 'Cómo funciona el código')}</h3>
      <p>{documentation.explanation[language] ?? documentation.explanation.en}</p>
      <p>
        {page === 'camera-sync'
          ? translate(language,
              'This page intentionally uses two providers. Each provider Hook creates a separate map view state, and camera events are forwarded to the other state.',
              'このページだけは2種類のProviderを同時に使います。各ProviderのHookが別々のmapViewStateを作り、一方のカメライベントをもう一方へ渡して同期します。',
              'Esta página usa dos proveedores a la vez. Cada Hook crea un estado de mapa independiente y los eventos de cámara se envían al otro estado.',
            )
          : translate(language,
              `A provider Hook creates mapViewState near the top of the React component. That object keeps the camera position and map design, and passing it to <${providerView} state={mapViewState}> connects it to the rendered map.`,
              `${providerHook}のようなHookは、Reactコンポーネントの先頭で呼び出します。返されたmapViewStateはカメラ位置や地図デザインを保持し、<${providerView} state={mapViewState}>へ渡すことで地図本体と接続されます。`,
              `Un Hook del proveedor crea mapViewState al inicio del componente React. Este objeto conserva la posición de la cámara y el diseño; al pasarlo a <${providerView} state={mapViewState}> queda conectado con el mapa renderizado.`,
            )}
      </p>
      <p>{stateExplanation}</p>
      <p>
        {translate(language,
          'The angle-bracket syntax is JSX. Attributes such as state={...} are props that pass a state object to a React component. Updating useState makes React evaluate the JSX again, which updates both the page and the map.',
          '山括弧で書かれた部分はJSXです。state={...}のような属性をpropsと呼び、ReactコンポーネントへStateを渡します。useStateの更新が起きるとReactがもう一度JSXを評価し、画面と地図が更新されます。',
          'La sintaxis entre ángulos es JSX. Los atributos como state={...} son props que pasan un objeto de estado al componente React. Cuando useState cambia, React vuelve a evaluar el JSX y actualiza la página y el mapa.',
        )}
      </p>
    </article>
  );
}
