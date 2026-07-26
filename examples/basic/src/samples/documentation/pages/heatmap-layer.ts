import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <HeatmapOverlay>
    <HeatmapPoints states={heatmapPoints} />
  </HeatmapOverlay>
</MapViewContainer>`,
  state: `const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPointState[]>([]);
useEffect(() => {
  fetch('/postoffice/postoffices.json')
    .then(response => response.json() as Promise<[number, number][]>)
    .then(data => setHeatmapPoints(data.map(([latitude, longitude], index) =>
      new HeatmapPointState({
        id: \`post-office-\${index}\`,
        position: createGeoPoint({ latitude, longitude }),
      }),
    )));
}, []);`,
  explanation: {
    en: [
      'Compose weighted geographic points inside the heatmap extension overlay.',
      'A useEffect fetches postoffices.json and maps each coordinate into a HeatmapPointState kept in React state.',
      'The <HeatmapPoints> inside <HeatmapOverlay> composes the whole set at once, and the extension renders the density map on any provider.',
    ],
    ja: [
      '重みを持つ地理座標の点群を、ヒートマップ拡張オーバーレイ内で一括構成します。',
      'useEffect が postoffices.json を取得し、各座標を HeatmapPointState へ変換して React の state に保持します。',
      '<HeatmapOverlay> 内の <HeatmapPoints> が点群をまとめて構成し、拡張がどのプロバイダーでも密度マップを描画します。',
    ],
    'es-419': [
      'Compone puntos geográficos ponderados dentro de la superposición de la extensión de mapa de calor.',
      'Un useEffect obtiene postoffices.json y convierte cada coordenada en un HeatmapPointState guardado en el estado de React.',
      'El <HeatmapPoints> dentro de <HeatmapOverlay> compone todo el conjunto de una vez, y la extensión dibuja el mapa de densidad en cualquier proveedor.',
    ],
  },
};

export default doc;
