import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <HeatmapOverlay>
    <HeatmapPoints states={heatmapPoints} />
  </HeatmapOverlay>
</MapViewContainer>`,
  state: `// Inline points work without the example app's public data files.
const heatmapPoints = useMemo(() => Array.from({ length: 100 }, (_, index) =>
  new HeatmapPointState({
    id: \`point-\${index}\`,
    position: createGeoPoint({
      latitude: 35.68 + Math.sin(index * 2.4) * (index % 10) * 0.001,
      longitude: 139.77 + Math.cos(index * 2.4) * (index % 10) * 0.001,
    }),
  }),
), []);`,
  explanation: {
    'en': [
      'HeatmapOverlay renders the density of geographic points.',
      'useMemo creates 100 sample HeatmapPointState objects without an external file. HeatmapPoints submits them together to the overlay.',
    ],
    'ja': [
      'HeatmapOverlay は地理座標の点群を密度マップとして描画します。',
      'この短い例は外部ファイルを使わず、useMemo で説明用の HeatmapPointState を100件生成します。HeatmapPoints が点群をまとめてオーバーレイへ渡します。',
    ],
    'es-419': [
      'HeatmapOverlay dibuja la densidad de puntos geográficos.',
      'useMemo crea 100 objetos HeatmapPointState de ejemplo sin archivos externos. HeatmapPoints los envía juntos a la capa.',
    ],
    'de': [
      'HeatmapOverlay zeichnet die Dichte geografischer Punkte.',
      'useMemo erzeugt 100 HeatmapPointState-Beispielpunkte ohne externe Datei. HeatmapPoints übergibt sie gemeinsam an das Overlay.',
    ],
    'th': [
      'HeatmapOverlay แสดงความหนาแน่นของจุดภูมิศาสตร์',
      'useMemo สร้าง HeatmapPointState ตัวอย่าง 100 จุดโดยไม่ใช้ไฟล์ภายนอก และ HeatmapPoints ส่งจุดทั้งหมดให้โอเวอร์เลย์พร้อมกัน',
    ],
    'hi': [
      'HeatmapOverlay भौगोलिक बिंदुओं का घनत्व दिखाता है।',
      'useMemo बाहरी फ़ाइल के बिना 100 उदाहरण HeatmapPointState बनाता है। HeatmapPoints उन्हें एक साथ ओवरले को देता है।',
    ],
  },
};

export default doc;
