import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <KMLLayer state={layerState} features={features} />
  {selected && (
    <InfoBubble position={selected.position}>
      <pre>{JSON.stringify(selected.properties, null, 2)}</pre>
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const features = useMemo(() => KMLParser.parse(
  '<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark>' +
  '<name>Sample route</name><LineString><coordinates>' +
  '139.75,35.68 139.77,35.69 139.79,35.68' +
  '</coordinates></LineString></Placemark></Document></kml>',
), []);
const [selected, setSelected] = useState<{
  position: GeoPoint; properties: Record<string, unknown>;
} | null>(null);
const layerState = useMemo(() => new KMLLayerState({
  onClick: (feature, position) => setSelected({ position: createGeoPoint(position), properties: feature.properties ?? {} }),
}), []);
const handleMapClick = (point: GeoPoint) => {
  if (!layerState.processClick(point, 10, mapViewState.cameraPosition.zoom)) setSelected(null);
};`,
  explanation: {
    'en': [
      'KMLParser.parse converts the inline KML route into features, and KMLLayer renders them.',
      'processClick tests the map click at the current zoom. layerState.onClick stores the placemark properties and position for the InfoBubble. Use KMLLoader when loading remote KML, KMZ or NetworkLink documents.',
    ],
    'ja': [
      'KMLParser.parse でコード内の KML 路線を Feature に変換し、KMLLayer で描画します。',
      'processClick が現在のズームでクリックを判定し、layerState.onClick が Placemark の属性と位置を保存して InfoBubble に表示します。外部の KML・KMZ・NetworkLink を読み込む場合は KMLLoader を利用できます。',
    ],
    'es-419': [
      'KMLParser.parse convierte la ruta KML incluida en elementos que KMLLayer dibuja.',
      'processClick comprueba el clic con el zoom actual. onClick guarda las propiedades para el InfoBubble. KMLLoader permite cargar KML, KMZ y NetworkLink remotos.',
    ],
    'de': [
      'KMLParser.parse wandelt die eingebettete KML-Route in Features für KMLLayer um.',
      'processClick prüft Klicks beim aktuellen Zoom. onClick speichert Attribute für die InfoBubble. KMLLoader lädt externe KML-, KMZ- und NetworkLink-Dokumente.',
    ],
    'th': [
      'KMLParser.parse แปลงเส้นทาง KML ในโค้ดเป็นฟีเจอร์ให้ KMLLayer วาด',
      'processClick ตรวจการคลิกด้วยซูมปัจจุบัน และ onClick เก็บคุณสมบัติให้ InfoBubble ใช้ KMLLoader เพื่อโหลด KML, KMZ หรือ NetworkLink ภายนอก',
    ],
    'hi': [
      'KMLParser.parse कोड के KML मार्ग को KMLLayer के फ़ीचर में बदलता है।',
      'processClick वर्तमान ज़ूम पर क्लिक जाँचता है और onClick गुणों को InfoBubble के लिए रखता है। बाहरी KML, KMZ और NetworkLink के लिए KMLLoader उपयोग करें।',
    ],
  },
};

export default doc;
