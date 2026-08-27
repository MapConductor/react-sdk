import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <MarkerClusterGroup
    markers={postOfficeMarkers}
    clusterIconProvider={clusterIconProvider}
    onClusterClick={zoomToCluster}
    minClusterSize={3}
    clusterRadiusPx={80}
  />
</MapViewContainer>`,
  state: `const [selected, setSelected] = useState<MarkerState | null>(null);
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
};`,
  explanation: {
    en: [
      'Cluster a large marker collection and provide a custom cluster icon and click behavior through the extension API.',
      'The same postOfficeMarkers array feeds MarkerClusterGroup instead of <Markers>, so nearby offices are grouped automatically as the map zooms out.',
      'clusterIconProvider draws the cluster badge, onClusterClick runs zoomToCluster to open a group, and minClusterSize with clusterRadiusPx tune how aggressively points merge.',
    ],
    ja: [
      '大量のマーカーをクラスタリングし、拡張 API を通じてクラスタアイコンとクリック動作を指定します。',
      '同じ postOfficeMarkers 配列を <Markers> ではなく MarkerClusterGroup へ渡すことで、地図を引くと近接する局が自動的にまとめられます。',
      'clusterIconProvider がクラスタのバッジを描画し、onClusterClick は zoomToCluster でグループを展開します。minClusterSize と clusterRadiusPx で結合の強さを調整します。',
    ],
    'es-419': [
      'Agrupa una colección grande de marcadores y define un icono y una acción de clic personalizados mediante la API de extensiones.',
      'El mismo arreglo postOfficeMarkers alimenta a MarkerClusterGroup en lugar de <Markers>, de modo que las oficinas cercanas se agrupan automáticamente al alejar el mapa.',
      'clusterIconProvider dibuja la insignia del grupo, onClusterClick ejecuta zoomToCluster para expandirlo, y minClusterSize con clusterRadiusPx ajustan la intensidad con que se combinan los puntos.',
    ],
    de: [
      'Eine große Markersammlung clustern und über die Erweiterungs-API ein eigenes Cluster-Icon und Klickverhalten mitgeben.',
      'Dasselbe postOfficeMarkers-Array speist MarkerClusterGroup statt <Markers>, sodass nahe beieinanderliegende Filialen beim Herauszoomen automatisch gruppiert werden.',
      'clusterIconProvider zeichnet das Cluster-Abzeichen, onClusterClick führt zoomToCluster aus, um eine Gruppe zu öffnen, und minClusterSize zusammen mit clusterRadiusPx regelt, wie stark Punkte zusammengefasst werden.',
    ],
    th: [
      'จัดกลุ่มมาร์กเกอร์จำนวนมาก และกำหนดไอคอนกลุ่มกับพฤติกรรมการคลิกเองผ่าน API ของส่วนขยาย',
      'อาร์เรย์ postOfficeMarkers ชุดเดิมถูกป้อนให้ MarkerClusterGroup แทน <Markers> ที่ทำการที่อยู่ใกล้กันจึงถูกจัดกลุ่มอัตโนมัติเมื่อซูมออก',
      'clusterIconProvider วาดป้ายของกลุ่ม onClusterClick เรียก zoomToCluster เพื่อเปิดกลุ่ม ส่วน minClusterSize กับ clusterRadiusPx ใช้ปรับว่าจะรวมจุดเข้าด้วยกันมากแค่ไหน',
    ],
    hi: [
      'बहुत सारे मार्कर का क्लस्टर बनाएँ, और एक्सटेंशन API से अपना क्लस्टर आइकन तथा क्लिक व्यवहार दें।',
      'वही postOfficeMarkers सरणी <Markers> की जगह MarkerClusterGroup को दी जाती है, इसलिए ज़ूम आउट करते ही पास-पास के डाकघर अपने आप समूह बन जाते हैं।',
      'clusterIconProvider क्लस्टर का बैज खींचता है, onClusterClick zoomToCluster चलाकर समूह खोलता है, और minClusterSize तथा clusterRadiusPx तय करते हैं कि बिंदु कितनी सख़्ती से जुड़ें।',
    ],
  },
};

export default doc;
