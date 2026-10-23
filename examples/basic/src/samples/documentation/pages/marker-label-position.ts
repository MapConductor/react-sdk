import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState}>
  <Markers states={markers} />
</MapViewContainer>`,
  state: `const POSITIONS: MarkerLabelPosition[] = [
  'left top', 'center top', 'right top',
  'left center', 'center center', 'right center',
  'left bottom', 'center bottom', 'right bottom',
];
const markers = useMemo(() => POSITIONS.map((labelPosition, index) => createMarkerState({
  id: labelPosition,
  position: positions[index],
  icon: new ColorDefaultIcon({
    label: '信州大学',
    labelPosition, // e.g. 'right center' draws the label beside the pin
  }),
})), [positions]);`,
  explanation: {
    en: [
      'Place a default marker’s label beside, above or below the pin instead of on top of it.',
      'labelPosition takes the same keywords as CSS background-position: a horizontal one (left / center / right) and a vertical one (top / center / bottom), in either order. A single keyword leaves the other axis at center.',
      'left and right put the label outside the pin and align it to the pin’s top, head or tip. In the center column, top and bottom move the label above or below the pin. The default, center center, keeps the label on the pin head as before.',
      'The icon grows only on the label’s side, and the pin tip stays on the marker’s position. Info bubbles still attach to the pin, not to the middle of the wider icon.',
    ],
    ja: [
      '既定マーカーのラベルを、ピンに重ねるのではなく横・上・下に置きます。',
      'labelPosition は CSS の background-position と同じキーワードを受け取ります。横（left / center / right）と縦（top / center / bottom）を空白で区切り、順序はどちらでも構いません。片方だけなら残りは center です。',
      'left / right はラベルをピンの外側に置き、縦はピンの上端・頭の中心・先端に揃えます。center の列では top / bottom がピンの上・下に置きます。既定の center center はこれまでどおりピンの頭に重ねます。',
      'アイコンはラベルの側にだけ広がり、ピンの先端はマーカーの位置に留まります。吹き出しも広がったアイコンの中央ではなく、ピンに付きます。',
    ],
    'es-419': [
      'Coloca la etiqueta de un marcador predeterminado al lado, encima o debajo del pin en lugar de sobre él.',
      'labelPosition usa las mismas palabras clave que background-position de CSS: una horizontal (left / center / right) y una vertical (top / center / bottom), en cualquier orden. Con una sola palabra, el otro eje queda en center.',
      'left y right colocan la etiqueta fuera del pin y la alinean con la parte superior, la cabeza o la punta del pin. En la columna center, top y bottom la llevan encima o debajo del pin. El valor predeterminado, center center, la mantiene sobre la cabeza del pin como antes.',
      'El icono solo crece hacia el lado de la etiqueta y la punta del pin sigue en la posición del marcador. Los globos de información siguen anclados al pin, no al centro del icono ampliado.',
    ],
    de: [
      'Die Beschriftung eines Standard-Markers neben, über oder unter die Nadel setzen statt darauf.',
      'labelPosition verwendet dieselben Schlüsselwörter wie CSS background-position: eines für die Horizontale (left / center / right) und eines für die Vertikale (top / center / bottom), in beliebiger Reihenfolge. Bei nur einem Schlüsselwort bleibt die andere Achse auf center.',
      'left und right setzen die Beschriftung außerhalb der Nadel und richten sie an deren Oberkante, Kopf oder Spitze aus. In der Spalte center rücken top und bottom sie über oder unter die Nadel. Der Standard center center belässt sie wie bisher auf dem Nadelkopf.',
      'Das Icon wächst nur zur Seite der Beschriftung, und die Nadelspitze bleibt auf der Markerposition. Info-Sprechblasen hängen weiterhin an der Nadel, nicht an der Mitte des breiteren Icons.',
    ],
    th: [
      'วางป้ายข้อความของมาร์กเกอร์เริ่มต้นไว้ข้าง ๆ ด้านบน หรือด้านล่างของหมุด แทนการวางทับหมุด',
      'labelPosition ใช้คีย์เวิร์ดเดียวกับ background-position ของ CSS คือแนวนอน (left / center / right) และแนวตั้ง (top / center / bottom) เรียงลำดับใดก็ได้ ถ้าระบุเพียงคำเดียว อีกแกนจะเป็น center',
      'left และ right วางป้ายไว้นอกหมุดและจัดให้ตรงกับขอบบน หัว หรือปลายของหมุด ในคอลัมน์ center ค่า top และ bottom จะย้ายป้ายไปไว้เหนือหรือใต้หมุด ค่าเริ่มต้น center center ยังคงวางป้ายบนหัวหมุดเหมือนเดิม',
      'ไอคอนจะขยายเฉพาะฝั่งที่มีป้าย และปลายหมุดยังอยู่ที่ตำแหน่งของมาร์กเกอร์ บับเบิลข้อมูลยังคงติดกับหมุด ไม่ใช่กึ่งกลางของไอคอนที่กว้างขึ้น',
    ],
    hi: [
      'डिफ़ॉल्ट मार्कर का लेबल पिन के ऊपर रखने के बजाय उसके बगल में, ऊपर या नीचे रखें।',
      'labelPosition वही कीवर्ड लेता है जो CSS का background-position लेता है: एक क्षैतिज (left / center / right) और एक ऊर्ध्वाधर (top / center / bottom), किसी भी क्रम में। सिर्फ़ एक कीवर्ड देने पर दूसरी धुरी center रहती है।',
      'left और right लेबल को पिन के बाहर रखते हैं और उसे पिन के ऊपरी सिरे, सिर या नोक से संरेखित करते हैं। center कॉलम में top और bottom लेबल को पिन के ऊपर या नीचे ले जाते हैं। डिफ़ॉल्ट center center पहले की तरह लेबल को पिन के सिर पर रखता है।',
      'आइकन सिर्फ़ लेबल की तरफ़ बढ़ता है और पिन की नोक मार्कर की जगह पर ही रहती है। इन्फ़ो बबल भी पिन से जुड़ा रहता है, चौड़े आइकन के बीच से नहीं।',
    ],
  },
};

export default doc;
