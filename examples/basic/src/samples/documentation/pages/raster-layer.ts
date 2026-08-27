import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `const layer = createRasterLayerState({
  tileSource,
  opacity,
});

<MapViewContainer state={mapViewState}>
  <RasterLayer state={layer} />
</MapViewContainer>`,
  state: `const [opacity, setOpacity] = useState(0.75);
const tileSource = RasterLayerSource.UrlTemplate({
  template: 'https://example.com/tiles/{z}/{x}/{y}.png',
  tileSize: 256,
});`,
  explanation: {
    en: [
      'Add a tiled raster source through the shared layer state and update its opacity without replacing the map.',
      'The tileSource is a RasterLayerSource.UrlTemplate pointing at a {z}/{x}/{y} tile URL, while opacity is held in React state.',
      'createRasterLayerState wraps both values, and changing opacity updates the existing RasterLayer in place instead of rebuilding the map.',
    ],
    ja: [
      '共通のレイヤー State からタイル形式のラスターデータを追加し、地図を作り直さず透明度を更新します。',
      'tileSource は {z}/{x}/{y} 形式の URL を指す RasterLayerSource.UrlTemplate で、opacity は React の state に保持します。',
      'createRasterLayerState が両者をまとめ、opacity を変更すると地図を作り直さずに既存の RasterLayer をその場で更新します。',
    ],
    'es-419': [
      'Agrega una fuente ráster en mosaicos mediante el estado compartido de la capa y cambia su opacidad sin recrear el mapa.',
      'El tileSource es un RasterLayerSource.UrlTemplate que apunta a una URL de mosaicos {z}/{x}/{y}, mientras que opacity se guarda en el estado de React.',
      'createRasterLayerState envuelve ambos valores, y cambiar opacity actualiza la RasterLayer existente en el sitio en lugar de reconstruir el mapa.',
    ],
    de: [
      'Über den gemeinsamen Ebenen-State eine gekachelte Rasterquelle hinzufügen und ihre Deckkraft ändern, ohne die Karte zu ersetzen.',
      'Die tileSource ist eine RasterLayerSource.UrlTemplate auf eine {z}/{x}/{y}-Kachel-URL, während die Deckkraft im React-State liegt.',
      'createRasterLayerState fasst beide Werte zusammen, und eine Änderung der Deckkraft aktualisiert den bestehenden RasterLayer an Ort und Stelle, statt die Karte neu aufzubauen.',
    ],
    th: [
      'เพิ่มแหล่งข้อมูลราสเตอร์แบบไทล์ผ่านสถานะเลเยอร์ร่วม และปรับความทึบได้โดยไม่ต้องเปลี่ยนแผนที่',
      'tileSource คือ RasterLayerSource.UrlTemplate ที่ชี้ไปยัง URL ของไทล์แบบ {z}/{x}/{y} ส่วนความทึบเก็บอยู่ในสถานะของ React',
      'createRasterLayerState ห่อค่าทั้งสองไว้ และการเปลี่ยนความทึบจะอัปเดต RasterLayer ตัวเดิมในที่ แทนที่จะสร้างแผนที่ใหม่',
    ],
    hi: [
      'साझा लेयर स्टेट से टाइल वाला रास्टर स्रोत जोड़ें, और मैप बदले बिना उसकी अपारदर्शिता अपडेट करें।',
      'tileSource एक RasterLayerSource.UrlTemplate है, जो {z}/{x}/{y} वाले टाइल URL की ओर इशारा करता है; अपारदर्शिता React स्टेट में रहती है।',
      'createRasterLayerState दोनों मानों को लपेटता है, और अपारदर्शिता बदलने पर मौजूदा RasterLayer वहीं अपडेट हो जाता है — मैप दोबारा नहीं बनता।',
    ],
  },
};

export default doc;
