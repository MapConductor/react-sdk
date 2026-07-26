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
  },
};

export default doc;
