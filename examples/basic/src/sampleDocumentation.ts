import type { SupportedLanguage } from './sampleRegistry';

interface SampleDocumentation {
  code: string;
  explanation: Record<'en' | 'ja', string> & Partial<Record<SupportedLanguage, string>>;
}

interface ProviderCode {
  component: string;
  openingProps: string;
  stateSetup: string;
}

const DOCUMENTATION: Record<string, SampleDocumentation> = {
  map: {
    code: `<MapViewContainer state={mapViewState} onMapClick={clearSelection}>
  <Markers states={storeMarkers} />
  {selectedMarker && (
    <InfoBubble marker={selectedMarker}>
      <StoreInfoView store={selectedMarker.extra} />
    </InfoBubble>
  )}
</MapViewContainer>`,
    explanation: {
      en: 'Render a collection of store markers in one composition and show an information bubble for the selected store.',
      ja: '店舗マーカーを一括で描画し、選択された店舗に情報を表示する吹き出しを重ねます。',
    },
  },
  'map-design': {
    code: `const handleDesignChange = (designId: string) => {
  const option = mapDesignOptions.find(item => item.design.id === designId);
  if (!option) return;
  mapViewState.mapDesignType = option.design;
  setSelectedDesignId(String(option.design.id));
};

<MapViewContainer state={mapViewState}>
  <select
    value={selectedDesignId}
    onChange={event => handleDesignChange(event.target.value)}
  >
    {mapDesignOptions.map(option => (
      <option key={String(option.design.id)} value={String(option.design.id)}>
        {option.label}
      </option>
    ))}
  </select>
</MapViewContainer>`,
    explanation: {
      en: 'Change the abstract map design on the view state. Each provider resolves it to its corresponding native style.',
      ja: '抽象的な地図デザインをViewStateへ設定します。各プロバイダーが対応するネイティブスタイルへ変換します。',
    },
  },
  'fly-to': {
    code: `<button onClick={() => mapViewState.moveCameraTo(destination, 1000)}>
  Fly to destination
</button>

<MapViewContainer state={mapViewState}>
  <Markers states={destinations} />
</MapViewContainer>`,
    explanation: {
      en: 'Move the camera to a destination with a one-second animation while using the same API for every provider.',
      ja: 'すべてのプロバイダーで共通のAPIを使い、目的地まで1秒間のアニメーションでカメラを移動します。',
    },
  },
  tilt: {
    code: `mapViewState.moveCameraTo(
  mapViewState.cameraPosition.copy({ tilt }),
  400,
);

<MapViewContainer state={mapViewState} />`,
    explanation: {
      en: 'Copy the current camera position, replace only its tilt, and animate the update.',
      ja: '現在のカメラ位置をコピーし、傾きだけを変更してアニメーション付きで反映します。',
    },
  },
  'visible-region': {
    code: `<MapViewContainer
  state={mapViewState}
  onCameraMove={camera => setRegion(camera.visibleRegion)}
/>

<VisibleRegionValues region={region} />`,
    explanation: {
      en: 'Read the provider-independent visible region from camera events, including its bounds and four corner coordinates.',
      ja: 'カメライベントから、境界と四隅の座標を含むプロバイダー非依存の表示領域を取得します。',
    },
  },
  'camera-sync': {
    code: `const syncCamera = (
  source: 'left' | 'right',
  camera: MapCameraPosition,
) => {
  const targetState = source === 'left' ? rightMapState : leftMapState;
  const targetGuard = source === 'left' ? rightProgrammatic : leftProgrammatic;
  if (targetGuard.current) return;

  targetGuard.current = true;
  targetState.moveCameraTo(camera, 0);
  requestAnimationFrame(() => { targetGuard.current = false; });
};

<div className="camera-grid">
  <MapLibreMapView
    state={leftMapState}
    onCameraMove={camera => syncCamera('left', camera)}
  />
  <LeafletMapView
    state={rightMapState}
    onCameraMove={camera => syncCamera('right', camera)}
  />
</div>`,
    explanation: {
      en: 'Forward camera changes between two independently rendered providers while suppressing feedback loops.',
      ja: '独立して描画した2つのプロバイダー間でカメラ変更を転送し、相互更新のループを抑制します。',
    },
  },
  marker: {
    code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {selected && <InfoBubble marker={selected}>{selected.extra}</InfoBubble>}
</MapViewContainer>`,
    explanation: {
      en: 'Compose markers with several icon sources and open a bubble when a marker is selected.',
      ja: '複数種類のアイコンを持つマーカーを構成し、選択されたマーカーに吹き出しを表示します。',
    },
  },
  'marker-animation': {
    code: `const marker = createMarkerState({
  position,
  animation: MarkerAnimation.Drop,
  onClick: state => state.animate(MarkerAnimation.Bounce),
});

<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
</MapViewContainer>`,
    explanation: {
      en: 'Set an initial marker animation and trigger another animation through the shared marker state API.',
      ja: '初期アニメーションを設定し、共通のマーカーState APIから別のアニメーションを実行します。',
    },
  },
  'post-office': {
    code: `<MapViewContainer
  state={mapViewState}
  markerTilingOptions={markerTilingOptions}
  onMapClick={() => setSelected(null)}
>
  <Markers states={postOfficeMarkers} />
  {selected && <PostOfficeInfoBubble marker={selected} />}
</MapViewContainer>`,
    explanation: {
      en: 'Use the batched Markers component for a large postal-office dataset and display details only for the selected item.',
      ja: '大量の郵便局データをMarkersコンポーネントで一括処理し、選択項目だけに詳細を表示します。',
    },
  },
  'post-office-cluster': {
    code: `<MapViewContainer state={mapViewState}>
  <MarkerClusterGroup
    markers={postOfficeMarkers}
    clusterIconProvider={clusterIconProvider}
    onClusterClick={zoomToCluster}
    minClusterSize={3}
    clusterRadiusPx={80}
  />
</MapViewContainer>`,
    explanation: {
      en: 'Cluster a large marker collection and provide a custom cluster icon and click behavior through the extension API.',
      ja: '大量のマーカーをクラスタリングし、拡張APIを通じてクラスタアイコンとクリック動作を指定します。',
    },
  },
  circle: {
    code: `<MapViewContainer state={mapViewState}>
  <Circle state={circleState} />
  <Polyline points={[center, edge]} zIndex={1} />
  <Marker position={center} />
  <Marker position={edge} draggable onDrag={resizeCircle} />
</MapViewContainer>`,
    explanation: {
      en: 'Draw a circle and resize its radius by dragging the edge marker. The radius line is ordered above the circle.',
      ja: '円を描画し、外周のマーカーをドラッグして半径を変更します。半径線は円より上に描画されます。',
    },
  },
  polyline: {
    code: `<MapViewContainer state={mapViewState}>
  <Polyline state={polylineState} />
  <Markers states={waypointMarkers} />
</MapViewContainer>`,
    explanation: {
      en: 'Draw a route from geographic points and expose its vertices as draggable waypoint markers.',
      ja: '地理座標の配列から経路を描画し、頂点をドラッグ可能なウェイポイントとして表示します。',
    },
  },
  'polyline-click': {
    code: `<MapViewContainer state={mapViewState}>
  <Polyline state={polyline} />
  <Polyline state={straightPolyline} />
  <Markers states={waypointMarkers} />
  <Markers states={clickMarkers} />
</MapViewContainer>`,
    explanation: {
      en: 'Handle polyline clicks and compare straight and geodesic paths while marking clicked positions.',
      ja: 'ポリラインのクリックを処理し、クリック位置を示しながら直線と測地線の経路を比較します。',
    },
  },
  polygon: {
    code: `<MapViewContainer state={mapViewState}>
  <Polygon state={polygonState} />
  <Markers states={vertexMarkers} />
</MapViewContainer>`,
    explanation: {
      en: 'Render a filled polygon and use markers to make each vertex visible and interactive.',
      ja: '塗りつぶしたポリゴンを描画し、各頂点をマーカーとして見える形で操作可能にします。',
    },
  },
  'polygon-click': {
    code: `<MapViewContainer state={mapViewState} onMapClick={showClickedMarker}>
  {polygons.map(polygon => (
    <Polygon
      key={polygon.id}
      state={polygon.copy({
        onClick: event => showClickedMarker(event.clicked),
      })}
    />
  ))}
  {marker && (
    <>
      <Marker state={marker} />
      <InfoBubble marker={marker}>{message}</InfoBubble>
    </>
  )}
</MapViewContainer>`,
    explanation: {
      en: 'Receive polygon click events through the common overlay API and display information at the clicked coordinate.',
      ja: '共通オーバーレイAPIでポリゴンのクリックを受け取り、クリック座標に情報を表示します。',
    },
  },
  'polygon-geodesic': {
    code: `<MapViewContainer state={mapViewState}>
  {polygons.map(polygon => (
    <Polygon key={polygon.id} state={polygon} />
  ))}
</MapViewContainer>`,
    explanation: {
      en: 'Compare geodesic and non-geodesic polygon edges over long distances and across the antimeridian.',
      ja: '長距離や日付変更線をまたぐ形状で、測地線と非測地線のポリゴン辺を比較します。',
    },
  },
  'polygon-hole': {
    code: `<MapViewContainer state={mapViewState}>
  <Polygon state={polygon} />
  <Markers states={vertexMarkers} />
</MapViewContainer>`,
    explanation: {
      en: 'Define an outer ring and one or more inner rings to render transparent holes inside a polygon.',
      ja: '外周リングと1つ以上の内周リングを指定し、ポリゴン内部に透明な穴を描画します。',
    },
  },
  'ground-image': {
    code: `<MapViewContainer state={mapViewState}>
  <GroundImage state={groundImageState} />
  <Markers states={cornerMarkers} />
</MapViewContainer>`,
    explanation: {
      en: 'Keep one GroundImageState instance and update its bounds from the draggable corner markers. The state observable sends each bounds change to the map provider.',
      ja: 'GroundImageStateは1つのインスタンスを保持し、ドラッグできる隅のマーカーからboundsを更新します。stateのObservableが各座標変更を地図Providerへ伝えます。',
    },
  },
  'raster-layer': {
    code: `const layer = createRasterLayerState({
  tileSource,
  opacity,
});

<MapViewContainer state={mapViewState}>
  <RasterLayer state={layer} />
</MapViewContainer>`,
    explanation: {
      en: 'Add a tiled raster source through the shared layer state and update its opacity without replacing the map.',
      ja: '共通のレイヤーStateからタイル形式のラスターデータを追加し、地図を作り直さず透明度を更新します。',
    },
  },
  'info-bubble-simple': {
    code: `<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
  {selected && (
    <InfoBubble marker={marker}>Simple text content</InfoBubble>
  )}
</MapViewContainer>`,
    explanation: {
      en: 'Anchor a simple React content bubble to a marker selected by the user.',
      ja: 'ユーザーが選択したマーカーに、シンプルなReactコンテンツの吹き出しを固定します。',
    },
  },
  'info-bubble-styled': {
    code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {activeMarker && (
    <InfoBubbleCustom marker={activeMarker} tailOffset={{ x: 0, y: 0.5 }}>
      <StyledContent />
    </InfoBubbleCustom>
  )}
</MapViewContainer>`,
    explanation: {
      en: 'Use a custom bubble component when the content, border, shadow, and tail need application-defined styling.',
      ja: '内容、枠線、影、しっぽをアプリ独自に装飾する場合はカスタム吹き出しを使用します。',
    },
  },
  'info-bubble-multiple': {
    code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
  {selectedMarkers.map(marker => (
    <InfoBubble key={marker.id} marker={marker}>
      {marker.extra}
    </InfoBubble>
  ))}
</MapViewContainer>`,
    explanation: {
      en: 'Keep multiple marker IDs selected and render one independently positioned bubble for each marker.',
      ja: '複数のマーカーIDを選択状態に保ち、それぞれの位置へ独立した吹き出しを描画します。',
    },
  },
  'info-bubble-rich': {
    code: `<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
  <InfoBubble marker={marker} bubbleColor="#ffffff">
    <article>
      <h3>Place details</h3>
      <button onClick={openDetails}>Open details</button>
    </article>
  </InfoBubble>
</MapViewContainer>`,
    explanation: {
      en: 'Render interactive React elements inside a marker-anchored bubble, including headings and buttons.',
      ja: '見出しやボタンなど、操作可能なReact要素をマーカーに固定した吹き出し内へ描画します。',
    },
  },
  'geojson-basic': {
    code: `<MapViewContainer state={mapViewState}>
  <GeoJSONLayer state={layer} features={features} />
</MapViewContainer>`,
    explanation: {
      en: 'Load GeoJSON features and render them with one provider-independent layer style.',
      ja: 'GeoJSONのFeatureを読み込み、プロバイダーに依存しない1つのレイヤースタイルで描画します。',
    },
  },
  'geojson-layer': {
    code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <GeoJSONLayer state={layerState} features={features} />
  {selected && (
    <InfoBubbleAtPosition position={selected.position}>
      <PropertyTable properties={selected.properties} />
    </InfoBubbleAtPosition>
  )}
</MapViewContainer>`,
    explanation: {
      en: 'Process clicks against GeoJSON features and show the selected feature properties at the geographic click position.',
      ja: 'GeoJSON Featureへのクリックを判定し、選択したFeatureの属性をクリック地点に表示します。',
    },
  },
  'heatmap-layer': {
    code: `<MapViewContainer state={mapViewState}>
  <HeatmapOverlay>
    <HeatmapPoints states={heatmapPoints} />
  </HeatmapOverlay>
</MapViewContainer>`,
    explanation: {
      en: 'Compose weighted geographic points inside the heatmap extension overlay.',
      ja: '重みを持つ地理座標の点群を、ヒートマップ拡張オーバーレイ内で一括構成します。',
    },
  },
  'threejs-object': {
    code: `function ThreeMapObject({ mapViewState, position }) {
  const isMapReady = useMapReady();

  useEffect(() => {
    if (!isMapReady) return;
    const holder = mapViewState.getMapViewHolder();
    if (!holder) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    camera.position.z = 200;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const width = holder.mapView.clientWidth;
    const height = holder.mapView.clientHeight;
    renderer.setSize(width, height);
    camera.right = width;
    camera.top = height;
    camera.updateProjectionMatrix();
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    holder.mapView.appendChild(renderer.domElement);

    const object = new THREE.Mesh(
      new THREE.TorusKnotGeometry(13, 4),
      new THREE.MeshNormalMaterial(),
    );
    scene.add(object);

    let frame = 0;
    const draw = () => {
      const offset = holder.toScreenOffset(position);
      if (offset && !(offset instanceof Promise)) {
        object.position.set(offset.x, height - offset.y, 0);
      }
      object.rotation.y += 0.02;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.remove();
      renderer.dispose();
    };
  }, [isMapReady, mapViewState, position]);

  return null;
}

<MapViewContainer state={mapViewState}>
  <ThreeMapObject mapViewState={mapViewState} position={position} />
</MapViewContainer>`,
    explanation: {
      en: 'Render a transparent Three.js canvas over the map and anchor its 3D object with the provider-independent MapViewHolder.toScreenOffset() projection.',
      ja: '透明なThree.jsのcanvasを地図へ重ね、Provider非依存のMapViewHolder.toScreenOffset()で立体オブジェクトを地理座標へ固定します。',
    },
  },
};

const FALLBACK: SampleDocumentation = {
  code: `<MapViewContainer state={mapViewState}>
  {/* MapConductor overlays */}
</MapViewContainer>`,
  explanation: {
    en: 'Render provider-independent overlays inside the shared MapConductor map view.',
    ja: 'MapConductorの共通地図ビュー内へ、プロバイダー非依存のオーバーレイを描画します。',
  },
};

const SPANISH_EXPLANATIONS: Record<string, string> = {
  map: 'Dibuja una colección de marcadores de tiendas en una sola composición y muestra un globo de información para la tienda seleccionada.',
  'map-design': 'Cambia el diseño abstracto del mapa en el estado de la vista. Cada proveedor lo convierte a su estilo nativo correspondiente.',
  'fly-to': 'Mueve la cámara a un destino con una animación de un segundo mediante la misma API para todos los proveedores.',
  tilt: 'Copia la posición actual de la cámara, cambia solo la inclinación y anima la actualización.',
  'visible-region': 'Obtiene de los eventos de cámara la región visible independiente del proveedor, incluidos sus límites y las cuatro esquinas.',
  'camera-sync': 'Transfiere los cambios de cámara entre dos proveedores renderizados de forma independiente y evita ciclos de actualización.',
  marker: 'Compone marcadores con distintos tipos de iconos y abre un globo cuando se selecciona un marcador.',
  'marker-animation': 'Configura una animación inicial y activa otra mediante la API compartida del estado del marcador.',
  'post-office': 'Usa el componente Markers por lotes para un conjunto grande de oficinas postales y muestra detalles solo del elemento seleccionado.',
  'post-office-cluster': 'Agrupa una colección grande de marcadores y define un icono y una acción de clic personalizados mediante la API de extensiones.',
  circle: 'Dibuja un círculo y cambia su radio arrastrando el marcador del borde. La línea del radio se dibuja sobre el círculo.',
  polyline: 'Dibuja una ruta a partir de coordenadas geográficas y muestra sus vértices como puntos de paso arrastrables.',
  'polyline-click': 'Controla los clics en una polilínea, compara rutas rectas y geodésicas y permite editar sus puntos de paso.',
  polygon: 'Dibuja un polígono relleno y usa marcadores para que cada vértice sea visible e interactivo.',
  'polygon-click': 'Comprueba si el punto seleccionado está dentro de un polígono y muestra el resultado en un marcador.',
  'polygon-geodesic': 'Compara bordes geodésicos y no geodésicos en distancias largas y al cruzar el antimeridiano.',
  'polygon-hole': 'Define un contorno exterior y varios contornos interiores cuyos vértices se pueden arrastrar para modificar los huecos.',
  'ground-image': 'Conserva una instancia de GroundImageState y actualiza sus límites desde marcadores de esquina arrastrables.',
  'raster-layer': 'Agrega una fuente ráster en mosaicos mediante el estado compartido de la capa y cambia su opacidad sin recrear el mapa.',
  'info-bubble-simple': 'Ancla un globo sencillo con contenido React al marcador seleccionado por el usuario.',
  'info-bubble-styled': 'Usa un globo personalizado cuando la aplicación necesita definir el contenido, borde, sombra y punta.',
  'info-bubble-multiple': 'Mantiene seleccionados varios marcadores y dibuja un globo independiente para cada uno.',
  'info-bubble-rich': 'Dibuja elementos React interactivos, como encabezados y botones, dentro de un globo anclado a un marcador.',
  'geojson-basic': 'Carga elementos GeoJSON y los dibuja con un estilo de capa independiente del proveedor.',
  'geojson-layer': 'Procesa clics sobre elementos GeoJSON y muestra sus propiedades en la posición geográfica seleccionada.',
  'heatmap-layer': 'Carga puntos geográficos y los compone por lotes dentro de la capa de mapa de calor.',
  'threejs-object': 'Superpone un lienzo transparente de Three.js y ancla el objeto 3D con la proyección MapViewHolder.toScreenOffset(), independiente del proveedor.',
};

const SECTION_COMMENTS: Record<SupportedLanguage, {
  map: string;
  state: string;
  render: string;
}> = {
  en: {
    map: 'Create the map',
    state: 'Prepare the data and interaction state',
    render: 'Render the map and its overlays',
  },
  ja: {
    map: '地図の作成',
    state: 'データと操作用Stateの準備',
    render: '地図とオーバーレイの描画',
  },
  'es-419': {
    map: 'Crear el mapa',
    state: 'Preparar los datos y el estado de interacción',
    render: 'Renderizar el mapa y sus capas',
  },
};

function initialCameraCode(): string {
  return `const initialCamera = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  zoom: 12,
});`;
}

function providerCode(provider: string | undefined): ProviderCode {
  const camera = initialCameraCode();
  switch (provider) {
    case 'arcgis':
    case 'arcgis-3d':
      return {
        component: provider === 'arcgis' ? 'ArcGISMapView2D' : 'ArcGISMapView',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useArcGISViewState({
  apiKey: import.meta.env.VITE_ARCGIS_API_KEY,
  mapDesignType: ArcGISDesign.Streets,
  cameraPosition: initialCamera,
});`,
      };
    case 'leaflet':
      return {
        component: 'LeafletMapView',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useLeafletMapViewState({
  mapDesignType: LeafletDesign.OpenStreetMap,
  cameraPosition: initialCamera,
});`,
      };
    case 'openlayers':
      return {
        component: 'OpenLayersMapView',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useOpenLayersMapViewState({
  mapDesignType: OpenLayersDesign.OpenStreetMap,
  cameraPosition: initialCamera,
});`,
      };
    case 'mapbox':
      return {
        component: 'MapBoxMapView2D',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useMapboxViewState({
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  mapDesignType: MapboxDesign.Streets,
  cameraPosition: initialCamera,
});`,
      };
    case 'google-maps-3d':
      return {
        component: 'GoogleMapView',
        openingProps: ' mapId="DEMO_MAP_ID"',
        stateSetup: `${camera}

const mapViewState = useGoogleMapViewState({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  mapDesignType: GoogleMapDesign.Normal,
  cameraPosition: initialCamera,
});`,
      };
    case 'google-maps':
      return {
        component: 'GoogleMapView2D',
        openingProps: ' mapId="DEMO_MAP_ID"',
        stateSetup: `${camera}

const mapViewState = useGoogleMapViewState({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  mapDesignType: GoogleMapDesign.Normal,
  cameraPosition: initialCamera,
});`,
      };
    case 'cesium':
      return {
        component: 'CesiumMapView',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useCesiumMapViewState({
  mapDesignType: CesiumDesign.Default,
  cameraPosition: initialCamera,
});`,
      };
    case 'here':
      return {
        component: 'HereMapView2D',
        openingProps: ' platform={platform}',
        stateSetup: `${camera}

const mapViewState = useHereViewState({
  mapDesignType: HereMapDesign.NormalDay,
  cameraPosition: initialCamera,
});
const platform = useMemo(
  () => new H.service.Platform({ apikey: import.meta.env.VITE_HERE_API_KEY }),
  [],
);`,
      };
    case 'maplibre-3d':
      return {
        component: 'MapLibreMapView',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useMapLibreViewState({
  mapDesignType: MapLibreDesign.OsmBrightJa,
  cameraPosition: initialCamera,
});`,
      };
    default:
      return {
        component: 'MapLibreMapView2D',
        openingProps: '',
        stateSetup: `${camera}

const mapViewState = useMapLibreViewState({
  mapDesignType: MapLibreDesign.OsmBrightJa,
  cameraPosition: initialCamera,
});`,
      };
  }
}

function stateExample(page: string | undefined): string {
  switch (page) {
    case 'map':
      return `const [selectedMarker, setSelectedMarker] = useState<MarkerState | null>(null);
const storeMarkers = useMemo(() => stores.map(store => createMarkerState({
  id: store.id,
  position: createGeoPoint({ latitude: store.lat, longitude: store.lng }),
  extra: store,
  onClick: markerState => setSelectedMarker(markerState),
})), [stores]);
const clearSelection = () => setSelectedMarker(null);`;
    case 'map-design':
      return `const mapDesignOptions = providerDesignOptions;
const [selectedDesignId, setSelectedDesignId] = useState(
  String(mapViewState.mapDesignType.id),
);`;
    case 'fly-to':
      return `const destination = createMapCameraPosition({
  position: createGeoPoint({ latitude: 35.6812, longitude: 139.7671 }),
  zoom: 13,
});
const destinations = [createMarkerState({ id: 'tokyo', position: destination.position })];`;
    case 'tilt':
      return `const [tilt, setTilt] = useState(0);`;
    case 'visible-region':
      return `const [region, setRegion] = useState<VisibleRegion | null>(null);`;
    case 'camera-sync':
      return `const leftMapState = useMapLibreViewState({
  mapDesignType: MapLibreDesign.OsmBrightJa,
  cameraPosition: initialCamera,
});
const rightMapState = useLeafletMapViewState({
  mapDesignType: LeafletDesign.OpenStreetMap,
  cameraPosition: initialCamera,
});
const leftProgrammatic = useRef(false);
const rightProgrammatic = useRef(false);`;
    case 'marker':
      return `const [selected, setSelected] = useState<MarkerState | null>(null);
const markers = useMemo(() => markerData.map(item => createMarkerState({
  id: item.id,
  position: createGeoPoint(item.position),
  icon: item.icon,
  onClick: markerState => setSelected(markerState),
})), [markerData]);`;
    case 'marker-animation':
      return `const position = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });`;
    case 'post-office':
    case 'post-office-cluster':
      return `const [selected, setSelected] = useState<MarkerState | null>(null);
const postOfficeMarkers = useMemo(() => postOffices.map(office => createMarkerState({
  id: office.id,
  position: createGeoPoint({ latitude: office.lat, longitude: office.lng }),
  extra: office,
  onClick: markerState => setSelected(markerState),
})), [postOffices]);
const markerTilingOptions = {
  ...MarkerTilingOptions.Default,
  iconScaleCallback: (_state: MarkerState, zoom: number) =>
    zoom > 10 ? 0.8 : zoom > 5 ? 0.5 : 0.2,
};`;
    case 'circle':
      return `const center = createGeoPoint({ latitude: 21.382314, longitude: -157.933097 });
const [edge, setEdge] = useState(() => calculatePositionAtDistance({
  center, distanceMeters: 1000, bearingDegrees: 90,
}));
const radiusMeters = useMemo(
  () => computeDistanceBetween(center, edge),
  [edge],
);
const circleState = useMemo(() => createCircleState({
  id: 'circle', center, radiusMeters,
  fillColor: 'rgba(37, 99, 235, 0.3)',
}), [radiusMeters]);
const resizeCircle = (markerState: MarkerState) => setEdge(markerState.position);`;
    case 'polyline':
      return `const [points, setPoints] = useState<GeoPoint[]>(initialPoints);
const polylineState = useMemo(() => createPolylineState({
  id: 'route', points, strokeColor: '#ef4444', strokeWidth: 4,
}), [points]);
const waypointMarkers = points.map((position, index) => createMarkerState({
  id: \`waypoint-\${index}\`, position, draggable: true,
}));`;
    case 'polyline-click':
      return `const [clickMarkers, setClickMarkers] = useState<MarkerState[]>([]);
const [points, setPoints] = useState([haneda, sanFrancisco, honolulu]);
const polyline = useMemo(() => createPolylineState({
  id: 'route', points, geodesic: true, strokeColor: '#ef4444',
  onClick: event => setClickMarkers(current => [
    ...current,
    createMarkerState({ id: \`click-\${current.length}\`, position: event.clicked }),
  ]),
}), [points]);
const straightPolyline = useMemo(() => polyline.copy({
  id: 'straight', geodesic: false, strokeColor: '#2563eb',
}), [polyline]);
const waypointMarkers = useMemo(() => points.map((position, index) =>
  createMarkerState({
    id: \`waypoint-\${index}\`, position, draggable: true,
    onDrag: markerState => setPoints(current => current.map(
      (point, pointIndex) => pointIndex === index ? markerState.position : point,
    )),
  })), [points]);`;
    case 'polygon':
      return `const [vertices, setVertices] = useState<GeoPoint[]>(initialVertices);
const polygonState = useMemo(() => createPolygonState({
  id: 'area',
  points: vertices,
  fillColor: 'rgba(37, 99, 235, 0.3)',
  strokeColor: '#2563eb',
}), [vertices]);
const vertexMarkers = vertices.map((position, index) => createMarkerState({
  id: \`vertex-\${index}\`, position, draggable: true,
}));`;
    case 'polygon-click':
      return `const polygons = useMemo(() => california.map((points, index) =>
  createPolygonState({ id: \`california-\${index}\`, points }),
), []);
const polygonManager = useMemo(() => {
  const manager = new PolygonManager<null>();
  polygons.forEach(polygon => manager.registerEntity(
    createPolygonEntity({ polygon: null, state: polygon }),
  ));
  return manager;
}, [polygons]);
const [marker, setMarker] = useState<MarkerState | null>(null);
const [message, setMessage] = useState('');
const showClickedMarker = (clicked: GeoPoint) => {
  setMessage(polygonManager.find(clicked) ? 'Inside' : 'Outside');
  setMarker(createMarkerState({ id: 'clicked', position: clicked }));
};`;
    case 'polygon-geodesic':
      return `const geodesicPolygon = useMemo(() => createPolygonState({
  id: 'geodesic', points: longDistancePoints, geodesic: true,
}), [longDistancePoints]);
const straightPolygon = useMemo(() => geodesicPolygon.copy({
  id: 'straight', geodesic: false,
}), [geodesicPolygon]);
const polygons = [geodesicPolygon, straightPolygon];`;
    case 'polygon-hole':
      return `const [holes, setHoles] = useState<GeoPoint[][]>(initialHoles);
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
), [holes]);`;
    case 'ground-image':
      return `const [groundImageState] = useState(() => createGroundImageState({
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
const cornerMarkers = [southWestMarker, northEastMarker];`;
    case 'raster-layer':
      return `const [opacity, setOpacity] = useState(0.75);
const tileSource = RasterLayerSource.UrlTemplate({
  template: 'https://example.com/tiles/{z}/{x}/{y}.png',
  tileSize: 256,
});`;
    case 'info-bubble-simple':
    case 'info-bubble-rich':
      return `const position = createGeoPoint({ latitude: 35.6812, longitude: 139.7671 });
const [selected, setSelected] = useState(false);
const marker = useMemo(() => createMarkerState({
  id: 'place', position, onClick: () => setSelected(true),
}), [position]);`;
    case 'info-bubble-styled':
    case 'info-bubble-multiple':
      return `const [selectedMarkers, setSelectedMarkers] = useState<MarkerState[]>([]);
const markers = useMemo(() => positions.map((position, index) => createMarkerState({
  id: \`marker-\${index}\`, position,
  onClick: markerState => setSelectedMarkers(current => [...current, markerState]),
})), [positions]);
const activeMarker = selectedMarkers.at(-1) ?? null;`;
    case 'geojson-basic':
      return `const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
const style = { fillColor: '#2563eb', fillOpacity: 0.35 };
const layer = useMemo(() => new GeoJSONLayerState({ id: 'places' }), []);`;
    case 'geojson-layer':
      return `const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
const [selected, setSelected] = useState<SelectedFeature | null>(null);
const layerState = useMemo(() => new GeoJSONLayerState({ id: 'railways' }), []);`;
    case 'heatmap-layer':
      return `const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPointState[]>([]);
useEffect(() => {
  fetch('/postoffice/postoffices.json')
    .then(response => response.json() as Promise<[number, number][]>)
    .then(data => setHeatmapPoints(data.map(([latitude, longitude], index) =>
      new HeatmapPointState({
        id: \`post-office-\${index}\`,
        position: createGeoPoint({ latitude, longitude }),
      }),
    )));
}, []);`;
    case 'threejs-object':
      return `const position = useMemo(() => createGeoPoint({
  latitude: 35.6812,
  longitude: 139.7671,
}), []);`;
    default:
      return '';
  }
}

function adaptProviderView(code: string, provider: ProviderCode): string {
  return code
    .split('<MapViewContainer').join(`<${provider.component}${provider.openingProps}`)
    .split('</MapViewContainer>').join(`</${provider.component}>`);
}

interface ImportDefinition {
  source: string;
  values: readonly string[];
  types?: readonly string[];
}

const IMPORT_DEFINITIONS: readonly ImportDefinition[] = [
  {
    source: 'react',
    values: ['useEffect', 'useMemo', 'useRef', 'useState'],
  },
  {
    source: '@mapconductor/js-sdk-core',
    values: [
      'MarkerAnimation',
      'MarkerTilingOptions',
      'PolygonManager',
      'RasterLayerSource',
      'calculatePositionAtDistance',
      'computeDistanceBetween',
      'createCircleState',
      'createGeoPoint',
      'createGeoRectBounds',
      'createGroundImageState',
      'createMapCameraPosition',
      'createMarkerState',
      'createPolygonState',
      'createPolygonEntity',
      'createPolylineState',
      'createRasterLayerState',
    ],
    types: [
      'GeoPoint',
      'MapCameraPosition',
      'MapDesignTypeInterface',
      'MapViewStateInterface',
      'MarkerState',
      'VisibleRegion',
    ],
  },
  {
    source: '@mapconductor/js-sdk-react',
    values: [
      'Circle',
      'GroundImage',
      'InfoBubble',
      'InfoBubbleAtPosition',
      'InfoBubbleCustom',
      'Marker',
      'Markers',
      'Polygon',
      'Polyline',
      'RasterLayer',
      'useMapReady',
    ],
  },
  {
    source: '@mapconductor/react-for-googlemaps',
    values: ['GoogleMapDesign', 'GoogleMapView', 'GoogleMapView2D', 'useGoogleMapViewState'],
  },
  {
    source: '@mapconductor/react-for-leaflet',
    values: ['LeafletDesign', 'LeafletMapView', 'useLeafletMapViewState'],
  },
  {
    source: '@mapconductor/react-for-openlayers',
    values: ['OpenLayersDesign', 'OpenLayersMapView', 'useOpenLayersMapViewState'],
  },
  {
    source: '@mapconductor/react-for-arcgis',
    values: ['ArcGISDesign', 'ArcGISMapView', 'ArcGISMapView2D', 'useArcGISViewState'],
  },
  {
    source: '@mapconductor/react-for-cesium',
    values: ['CesiumDesign', 'CesiumMapView', 'useCesiumMapViewState'],
  },
  {
    source: '@mapconductor/react-for-here',
    values: ['HereMapDesign', 'HereMapView2D', 'useHereViewState'],
  },
  {
    source: '@mapconductor/react-for-maplibre',
    values: ['MapLibreDesign', 'MapLibreMapView', 'MapLibreMapView2D', 'useMapLibreViewState'],
  },
  {
    source: '@mapconductor/react-for-mapbox',
    values: ['MapboxDesign', 'MapBoxMapView', 'MapBoxMapView2D', 'useMapboxViewState'],
  },
  {
    source: '@mapconductor/react-geojson-layer',
    values: ['GeoJSONLayer', 'GeoJSONLayerState'],
    types: ['GeoJSONFeatureData'],
  },
  {
    source: '@mapconductor/react-heatmap',
    values: ['HeatmapOverlay', 'HeatmapPointState', 'HeatmapPoints'],
  },
  {
    source: '@mapconductor/react-marker-clustering',
    values: ['MarkerClusterGroup'],
  },
];

function usesIdentifier(code: string, identifier: string): boolean {
  return new RegExp(`\\b${identifier}\\b`).test(code);
}

function formatImport(definition: ImportDefinition, code: string): string | null {
  const names = [
    ...definition.values.filter(name => usesIdentifier(code, name)),
    ...(definition.types ?? [])
      .filter(name => usesIdentifier(code, name))
      .map(name => `type ${name}`),
  ];
  if (names.length === 0) return null;
  if (names.length <= 3) {
    return `import { ${names.join(', ')} } from '${definition.source}';`;
  }
  return `import {\n${names.map(name => `  ${name},`).join('\n')}\n} from '${definition.source}';`;
}

function importCode(code: string): string {
  const imports = IMPORT_DEFINITIONS
    .map(definition => formatImport(definition, code))
    .filter((value): value is string => value !== null);
  if (usesIdentifier(code, 'THREE')) {
    imports.splice(1, 0, "import * as THREE from 'three';");
  }
  return imports.join('\n');
}

export function getSampleDocumentation(
  page: string | undefined,
  providerName?: string,
  language: SupportedLanguage = 'en',
): SampleDocumentation {
  const documentation = DOCUMENTATION[page ?? ''] ?? FALLBACK;
  const provider = providerCode(providerName);
  const state = stateExample(page);
  const providerSetup = page === 'camera-sync'
    ? initialCameraCode()
    : provider.stateSetup;
  const comments = SECTION_COMMENTS[language];
  const stateSection = state
    ? [`// (2) ${comments.state}`, state].join('\n')
    : '';
  const mainCode = [
    `// (1) ${comments.map}`,
    providerSetup,
    stateSection,
    `// (${state ? 3 : 2}) ${comments.render}`,
    adaptProviderView(documentation.code, provider),
  ].filter(Boolean).join('\n\n');
  return {
    ...documentation,
    explanation: {
      ...documentation.explanation,
      'es-419': SPANISH_EXPLANATIONS[page ?? ''] ?? 'Renderiza capas independientes del proveedor dentro de la vista de mapa compartida de MapConductor.',
    },
    code: [importCode(mainCode), mainCode]
      .filter(Boolean)
      .join('\n\n'),
  };
}
