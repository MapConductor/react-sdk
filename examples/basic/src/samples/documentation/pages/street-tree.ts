import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  state: `// A few inline records keep the example independent of a data server.
const trees = useMemo(() => [
  { id: 'tree-1', species: 'Ginkgo', latitude: 35.681, longitude: 139.765 },
  { id: 'tree-2', species: 'Cherry', latitude: 35.683, longitude: 139.768 },
], []);
const [selected, setSelected] = useState<MarkerState | null>(null);
const markers = useMemo(() => trees.map(tree => createMarkerState({
  id: tree.id, position: createGeoPoint(tree), extra: tree.species,
  icon: new ColorDefaultIcon({ fillColor: '#15803d', label: tree.species }),
  onClick: marker => setSelected(marker),
})), [trees]);`,
  code: `<MapViewContainer state={mapViewState} onMapClick={() => setSelected(null)}>
  <Markers states={markers} />
  {selected && <InfoBubble marker={selected}>{selected.extra as string}</InfoBubble>}
</MapViewContainer>`,
  explanation: {
    en: ['Create markers from tree records and use extra to retain each species name. Click a marker to display the name in an InfoBubble. Replace the inline records with your street-tree dataset.'],
    ja: ['樹木データからマーカーを生成し、樹種名を extra に保持します。クリックしたマーカーの情報を InfoBubble に表示します。この短い例のデータは説明用で、実際の街路樹データへ置き換えられます。'],
    'es-419': ['Crea marcadores a partir de árboles y guarda la especie en extra. Haz clic para mostrarla en un InfoBubble. Los registros son ilustrativos: reemplázalos con tus datos de árboles urbanos.'],
    de: ['Erzeugen Sie Marker aus Baumdatensätzen und speichern Sie die Art in extra. Ein Klick zeigt sie in einer InfoBubble. Ersetzen Sie die Beispieldaten durch Ihren Straßenbaumdatensatz.'],
    th: ['สร้างมาร์กเกอร์จากข้อมูลต้นไม้และเก็บชื่อชนิดใน extra คลิกเพื่อแสดงใน InfoBubble ข้อมูลนี้ใช้ประกอบตัวอย่างและเปลี่ยนเป็นข้อมูลต้นไม้ริมถนนจริงได้'],
    hi: ['पेड़ों के रिकॉर्ड से मार्कर बनाएँ और प्रजाति extra में रखें। क्लिक करने पर InfoBubble में नाम दिखता है। उदाहरण रिकॉर्ड की जगह अपना सड़क के पेड़ों का डेटा दें।'],
  },
};
export default doc;
