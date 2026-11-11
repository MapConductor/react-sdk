import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  helpers: `function ProjectedValues({ holder, point }: { holder: MapViewHolder<unknown, unknown> | null; point: GeoPoint | null }) {
  if (!holder || !point) return <p>Tap the map to project the tapped point.</p>;
  const projected = holder.toProjectedPoint(point);
  const back = projected ? holder.fromProjectedPoint(projected) : null;
  return <pre>{JSON.stringify({
    coordinateSystem: holder.coordinateSystem,
    projected,
    back: back?.toUrlValue(6),
  }, null, 2)}</pre>;
}`,
  code: `<MapViewContainer
  state={mapViewState}
  onMapClick={point => setTapped(point)}
/>

<ProjectedValues holder={mapViewState.getMapViewHolder()} point={tapped} />`,
  state: `const [tapped, setTapped] = useState<GeoPoint | null>(null);`,
  explanation: {
    en: [
      'Convert between latitude/longitude and the coordinate system the map engine lays the map out in. These are not screen coordinates.',
      'coordinateSystem tells which system the values are in, such as EPSG:3857 in meters. Engines that only have Mercator, and globe display, use EPSG:3857.',
      'toProjectedPoint projects a point and fromProjectedPoint converts it back, so the round trip returns the original point.',
    ],
    ja: [
      '緯度経度と、地図エンジンが地図を並べている座標系の値を相互に変換します。画面座標ではありません。',
      'coordinateSystem は値がどの座標系か（EPSG:3857 のメートルなど）を示します。Mercator しか持たないエンジンと地球儀表示は EPSG:3857 です。',
      'toProjectedPoint で投影し、fromProjectedPoint で戻すと元の地点に戻ります。',
    ],
    'es-419': [
      'Convierte entre latitud/longitud y el sistema de coordenadas en que el motor dispone el mapa. No son coordenadas de pantalla.',
      'coordinateSystem indica en qué sistema están los valores, por ejemplo EPSG:3857 en metros. Los motores solo Mercator y la vista de globo usan EPSG:3857.',
      'toProjectedPoint proyecta un punto y fromProjectedPoint lo revierte, de modo que la ida y vuelta devuelve el punto original.',
    ],
    de: [
      'Rechnet zwischen Breite/Länge und dem Koordinatensystem um, in dem die Karten-Engine die Karte anordnet. Das sind keine Bildschirmkoordinaten.',
      'coordinateSystem gibt an, in welchem System die Werte liegen, etwa EPSG:3857 in Metern. Reine Mercator-Engines und die Globusansicht verwenden EPSG:3857.',
      'toProjectedPoint projiziert einen Punkt, fromProjectedPoint rechnet ihn zurück; der Hin- und Rückweg ergibt wieder den ursprünglichen Punkt.',
    ],
    th: [
      'แปลงระหว่างละติจูด/ลองจิจูด กับระบบพิกัดที่เอนจินแผนที่ใช้จัดวางแผนที่ ไม่ใช่พิกัดบนหน้าจอ',
      'coordinateSystem บอกว่าค่าอยู่ในระบบใด เช่น EPSG:3857 หน่วยเมตร เอนจินที่มีแต่ Mercator และการแสดงแบบลูกโลกใช้ EPSG:3857',
      'toProjectedPoint ฉายจุด และ fromProjectedPoint แปลงกลับ การแปลงไปกลับจึงได้จุดเดิม',
    ],
    hi: [
      'अक्षांश/देशांतर और उस निर्देशांक प्रणाली के बीच रूपांतरण करें जिसमें मैप इंजन मैप को रखता है। ये स्क्रीन निर्देशांक नहीं हैं।',
      'coordinateSystem बताता है कि मान किस प्रणाली में हैं, जैसे मीटर में EPSG:3857। केवल Mercator वाले इंजन और ग्लोब दृश्य EPSG:3857 का उपयोग करते हैं।',
      'toProjectedPoint बिंदु को प्रक्षेपित करता है और fromProjectedPoint उसे वापस बदलता है, इसलिए आना-जाना मूल बिंदु लौटाता है।',
    ],
  },
};

export default doc;
