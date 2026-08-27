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
    de: [
      'GeoJSON-Features laden und mit einem einzigen anbieterunabhängigen Ebenenstil zeichnen.',
      'Die Features liegen im React-State, und layer ist ein einmalig mit useMemo erzeugter GeoJSONLayerState.',
      'Beides an <GeoJSONLayer> übergeben zeichnet jedes Feature mit einem gemeinsamen Stil, der bei jedem Anbieter gleich aussieht.',
    ],
    th: [
      'โหลดฟีเจอร์ GeoJSON แล้ววาดด้วยสไตล์เลเยอร์ชุดเดียวที่ไม่ผูกกับผู้ให้บริการ',
      'ฟีเจอร์เก็บอยู่ในสถานะของ React ส่วน layer คือ GeoJSONLayerState ที่สร้างครั้งเดียวด้วย useMemo',
      'การส่งทั้งสองเข้า <GeoJSONLayer> จะวาดทุกฟีเจอร์ด้วยสไตล์ร่วมชุดเดียว ซึ่งหน้าตาเหมือนกันบนผู้ให้บริการทุกเจ้า',
    ],
    hi: [
      'GeoJSON फ़ीचर लोड करें और उन्हें एक ही प्रोवाइडर-निरपेक्ष लेयर स्टाइल से रेंडर करें।',
      'फ़ीचर React स्टेट में रहते हैं, और layer एक GeoJSONLayerState है जो useMemo से एक बार बनता है।',
      'दोनों को <GeoJSONLayer> को देने पर हर फ़ीचर एक ही साझा स्टाइल से खिंचता है, जो किसी भी प्रोवाइडर पर एक जैसा दिखता है।',
    ],
  },
};

export default doc;
