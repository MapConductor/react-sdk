import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <GeoJSONLayer state={layer} features={features} />
</MapViewContainer>`,
  state: `const [features, setFeatures] = useState<GeoJSONFeatureData[]>([]);
const style = { fillColor: '#2563eb', fillOpacity: 0.35 };
const layer = useMemo(() => new GeoJSONLayerState({ id: 'places' }), []);`,
  explanation: {
    en: [
      'Load GeoJSON features and render them with one provider-independent layer style.',
      'The features live in React state and layer is a GeoJSONLayerState created once with useMemo.',
      'Passing both to <GeoJSONLayer> draws every feature with a single shared style that looks the same on any provider.',
    ],
    ja: [
      'GeoJSON の Feature を読み込み、プロバイダーに依存しない1つのレイヤースタイルで描画します。',
      'features は React の state に保持し、layer は useMemo で一度だけ生成した GeoJSONLayerState です。',
      '両方を <GeoJSONLayer> へ渡すと、すべての Feature が共有の1スタイルで描画され、どのプロバイダーでも同じ見た目になります。',
    ],
    'es-419': [
      'Carga elementos GeoJSON y los dibuja con un estilo de capa independiente del proveedor.',
      'Los features viven en el estado de React y layer es un GeoJSONLayerState creado una sola vez con useMemo.',
      'Pasar ambos a <GeoJSONLayer> dibuja cada elemento con un único estilo compartido que se ve igual en cualquier proveedor.',
    ],
  },
};

export default doc;
