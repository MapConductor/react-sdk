import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <GeoJSONLayer state={layer} features={features} />
</MapViewContainer>`,
  state: `// GeoJSON coordinates use [longitude, latitude]. Rings must be closed.
const features = useMemo(() => GeoJSONParser.parseFeatures(JSON.stringify({
  type: 'FeatureCollection',
  features: [{
    type: 'Feature', properties: { name: 'Area with a hole' },
    geometry: { type: 'Polygon', coordinates: [
      [[139.74, 35.70], [139.74, 35.66], [139.80, 35.66], [139.80, 35.70], [139.74, 35.70]],
      [[139.76, 35.69], [139.78, 35.68], [139.76, 35.67], [139.76, 35.69]],
    ] },
  }],
})), []);
const layer = useMemo(() => new GeoJSONLayerState({
  fillColor: colorArgb(127, 0x3b, 0xb2, 0xd0),
  strokeColor: colorArgb(255, 0x1d, 0x70, 0x82),
  strokeWidth: 2,
}), []);`,
  explanation: {
    'en': [
      'GeoJSONParser.parseFeatures converts inline GeoJSON into layer features. Coordinates use longitude before latitude, and polygon rings must be closed.',
      'GeoJSONLayerState supplies the shared fill and stroke. GeoJSONLayer renders the polygon and its hole from the memoized features.',
    ],
    'ja': [
      'GeoJSONParser.parseFeatures でコード内の GeoJSON を Feature 配列に変換します。座標は経度・緯度の順で、ポリゴンの各リングは始点と終点を一致させます。',
      'GeoJSONLayerState に塗りと線を設定し、useMemo で保持した features とともに GeoJSONLayer へ渡すと、穴付きポリゴンを描画できます。',
    ],
    'es-419': [
      'GeoJSONParser.parseFeatures convierte el GeoJSON incluido en elementos de capa. Las coordenadas usan longitud antes de latitud y los anillos deben estar cerrados.',
      'GeoJSONLayerState define el relleno y el trazo. GeoJSONLayer dibuja el polígono con su hueco.',
    ],
    'de': [
      'GeoJSONParser.parseFeatures wandelt eingebettetes GeoJSON in Features um. Koordinaten stehen als Länge vor Breite; Polygonringe müssen geschlossen sein.',
      'GeoJSONLayerState definiert Füllung und Kontur. GeoJSONLayer zeichnet das Polygon mit seinem Loch.',
    ],
    'th': [
      'GeoJSONParser.parseFeatures แปลง GeoJSON ในโค้ดเป็นฟีเจอร์ พิกัดเรียงลองจิจูดก่อนละติจูด และวงแหวนของโพลีกอนต้องปิด',
      'GeoJSONLayerState กำหนดสีเติมและเส้นขอบ ส่วน GeoJSONLayer วาดโพลีกอนพร้อมรูจากฟีเจอร์ที่เก็บด้วย useMemo',
    ],
    'hi': [
      'GeoJSONParser.parseFeatures कोड के GeoJSON को फ़ीचर में बदलता है। निर्देशांक में देशांतर पहले आता है और पॉलीगॉन के रिंग बंद होने चाहिए।',
      'GeoJSONLayerState भराव और रेखा तय करता है। GeoJSONLayer छेद वाला पॉलीगॉन बनाता है।',
    ],
  },
};

export default doc;
