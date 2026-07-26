import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  {polygons.map(polygon => (
    <Polygon key={polygon.id} state={polygon} />
  ))}
</MapViewContainer>`,
  state: `const geodesicPolygon = useMemo(() => createPolygonState({
  id: 'geodesic', points: longDistancePoints, geodesic: true,
}), [longDistancePoints]);
const straightPolygon = useMemo(() => geodesicPolygon.copy({
  id: 'straight', geodesic: false,
}), [geodesicPolygon]);
const polygons = [geodesicPolygon, straightPolygon];`,
  explanation: {
    en: [
      'Compare geodesic and non-geodesic polygon edges over long distances and across the antimeridian.',
      'geodesicPolygon is built with geodesic:true, and straightPolygon is a .copy of it with geodesic:false over the same longDistancePoints.',
      'Rendering both shows how geodesic edges curve to follow the shortest path while straight edges stay flat on the map projection.',
    ],
    ja: [
      '長距離や日付変更線をまたぐ形状で、測地線と非測地線のポリゴン辺を比較します。',
      'geodesicPolygon は geodesic:true で作成し、straightPolygon は同じ longDistancePoints に対して geodesic:false を指定した .copy です。',
      '両方を描画すると、測地線の辺が最短経路に沿って湾曲し、非測地線の辺は投影上でまっすぐ描かれる違いが分かります。',
    ],
    'es-419': [
      'Compara bordes de polígono geodésicos y no geodésicos en distancias largas y al cruzar el antimeridiano.',
      'geodesicPolygon se construye con geodesic:true, y straightPolygon es una .copy con geodesic:false sobre los mismos longDistancePoints.',
      'Dibujar ambos muestra cómo los bordes geodésicos se curvan para seguir la ruta más corta mientras que los rectos permanecen planos en la proyección del mapa.',
    ],
  },
};

export default doc;
