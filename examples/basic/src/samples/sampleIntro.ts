import type { Phrase } from './language';

/**
 * Per-page intro hint shown as a dialog over the map the first time a sample
 * page is opened in a session. Content is a short action instruction plus an
 * optional GIF that demonstrates the interaction (drop the file under
 * `public/intro/<page>.gif`).
 */
export interface SampleIntro {
  /** Public path to an animated GIF demonstrating the interaction, if any. */
  gif?: string;
  /** One-line action hint, in the languages it has been written in. */
  instruction: Phrase;
}

function intro(page: string, instruction: Phrase): [string, SampleIntro] {
  return [page, { gif: `/intro/${page}.gif`, instruction }];
}

const INTROS: Record<string, SampleIntro> = Object.fromEntries([
  intro(
    'map',
    {
      en: 'Tap a store marker to open its info bubble.',
      ja: '店舗マーカーをタップすると情報が表示されます。',
      'es-419': 'Toca un marcador de tienda para abrir su globo de información.',
      de: 'Tippen Sie einen Filial-Marker an, um seine Info-Sprechblase zu öffnen.',
      th: 'แตะมาร์กเกอร์ร้านค้าเพื่อเปิดบับเบิลข้อมูล',
      hi: 'किसी स्टोर मार्कर पर टैप करने से उसका इन्फ़ो बबल खुलता है।',
    },
  ),
  intro(
    'map-design',
    {
      en: 'Use the selector to switch the map design.',
      ja: 'セレクターで地図デザインを切り替えてみましょう。',
      'es-419': 'Usa el selector para cambiar el diseño del mapa.',
      de: 'Wechseln Sie das Kartendesign über die Auswahl.',
      th: 'ใช้ตัวเลือกเพื่อสลับดีไซน์แผนที่',
      hi: 'सिलेक्टर से मैप डिज़ाइन बदलें।',
    },
  ),
  intro(
    'fly-to',
    {
      en: 'Press the button to fly the camera to the destination.',
      ja: 'ボタンを押すとカメラが目的地へ移動します。',
      'es-419': 'Pulsa el botón para volar la cámara al destino.',
      de: 'Drücken Sie die Taste, um die Kamera zum Ziel fliegen zu lassen.',
      th: 'กดปุ่มเพื่อให้กล้องเคลื่อนไปยังจุดหมาย',
      hi: 'बटन दबाने से कैमरा गंतव्य तक उड़ जाता है।',
    },
  ),
  intro(
    'tilt',
    {
      en: 'Adjust the tilt control to lean the map.',
      ja: '傾きを変えると地図が傾きます。',
      'es-419': 'Ajusta el control de inclinación para inclinar el mapa.',
      de: 'Verstellen Sie den Neigungsregler, um die Karte zu kippen.',
      th: 'ปรับแถบการเอียงเพื่อเอียงแผนที่',
      hi: 'झुकाव का कंट्रोल घुमाने से मैप झुक जाता है।',
    },
  ),
  intro(
    'visible-region',
    {
      en: 'Pan or zoom the map to update the visible region.',
      ja: '地図を動かすと表示領域の値が更新されます。',
      'es-419': 'Desplaza o haz zoom para actualizar la región visible.',
      de: 'Verschieben oder zoomen Sie die Karte, um den sichtbaren Bereich zu aktualisieren.',
      th: 'เลื่อนหรือซูมแผนที่เพื่ออัปเดตพื้นที่ที่มองเห็น',
      hi: 'मैप को खिसकाने या ज़ूम करने पर दृश्य क्षेत्र अपडेट होता है।',
    },
  ),
  intro(
    'camera-sync',
    {
      en: 'Move one map and watch the other follow in sync.',
      ja: '片方の地図を動かすと、もう片方が同期して追従します。',
      'es-419': 'Mueve un mapa y observa cómo el otro se sincroniza.',
      de: 'Bewegen Sie eine Karte und sehen Sie zu, wie die andere synchron folgt.',
      th: 'เลื่อนแผนที่ฝั่งหนึ่ง แล้วดูอีกฝั่งเลื่อนตามแบบซิงก์กัน',
      hi: 'एक मैप हिलाइए और देखिए दूसरा उसी के साथ चलता है।',
    },
  ),
  intro(
    'marker',
    {
      en: 'Tap a marker to open its bubble.',
      ja: 'マーカーをタップすると吹き出しが開きます。',
      'es-419': 'Toca un marcador para abrir su globo.',
      de: 'Tippen Sie einen Marker an, um seine Sprechblase zu öffnen.',
      th: 'แตะมาร์กเกอร์เพื่อเปิดบับเบิลของมาร์กเกอร์นั้น',
      hi: 'किसी मार्कर पर टैप करने से उसका बबल खुलता है।',
    },
  ),
  intro(
    'marker-animation',
    {
      en: 'Tap the marker to trigger its bounce animation.',
      ja: 'マーカーをタップするとバウンドします。',
      'es-419': 'Toca el marcador para activar su animación de rebote.',
      de: 'Tippen Sie den Marker an, um seine Bounce-Animation auszulösen.',
      th: 'แตะมาร์กเกอร์เพื่อเล่นแอนิเมชันเด้ง',
      hi: 'मार्कर पर टैप करने से उसका बाउंस एनिमेशन चलता है।',
    },
  ),
  intro(
    'post-office',
    {
      en: 'Zoom in and tap a post office to see its details.',
      ja: 'ズームして郵便局をタップすると詳細が表示されます。',
      'es-419': 'Acércate y toca una oficina postal para ver sus detalles.',
      de: 'Zoomen Sie hinein und tippen Sie eine Postfiliale an, um die Details zu sehen.',
      th: 'ซูมเข้าแล้วแตะที่ทำการไปรษณีย์เพื่อดูรายละเอียด',
      hi: 'ज़ूम करके किसी डाकघर पर टैप करने से उसका ब्योरा दिखता है।',
    },
  ),
  intro(
    'post-office-cluster',
    {
      en: 'Tap a cluster to zoom into its markers.',
      ja: 'クラスタをタップすると中のマーカーへズームします。',
      'es-419': 'Toca un grupo para acercarte a sus marcadores.',
      de: 'Tippen Sie einen Cluster an, um zu seinen Markern zu zoomen.',
      th: 'แตะกลุ่มเพื่อซูมเข้าไปยังมาร์กเกอร์ข้างใน',
      hi: 'किसी क्लस्टर पर टैप करने से उसके मार्कर तक ज़ूम हो जाता है।',
    },
  ),
  intro(
    'circle',
    {
      en: 'Drag the edge marker to resize the circle.',
      ja: '外周のマーカーをドラッグすると半径が変わります。',
      'es-419': 'Arrastra el marcador del borde para cambiar el radio.',
      de: 'Ziehen Sie den Rand-Marker, um den Kreis zu vergrößern oder zu verkleinern.',
      th: 'ลากมาร์กเกอร์ที่ขอบเพื่อเปลี่ยนขนาดวงกลม',
      hi: 'किनारे का मार्कर खींचने से वृत्त का आकार बदलता है।',
    },
  ),
  intro(
    'polyline',
    {
      en: 'Drag a waypoint marker to reshape the route.',
      ja: 'ウェイポイントをドラッグすると経路が変わります。',
      'es-419': 'Arrastra un punto de paso para remodelar la ruta.',
      de: 'Ziehen Sie einen Wegpunkt-Marker, um die Route umzuformen.',
      th: 'ลากมาร์กเกอร์จุดผ่านเพื่อเปลี่ยนรูปของเส้นทาง',
      hi: 'किसी वेपॉइंट मार्कर को खींचने से रास्ता बदल जाता है।',
    },
  ),
  intro(
    'polyline-click',
    {
      en: 'Tap the curved polyline to drop a marker at that spot.',
      ja: '曲線のポリラインをタップすると、その位置にマーカーが追加されます。',
      'es-419': 'Toca la polilínea curva para colocar un marcador en ese punto.',
      de: 'Tippen Sie auf die gebogene Polylinie, um dort einen Marker zu setzen.',
      th: 'แตะโพลีไลน์โค้งเพื่อวางมาร์กเกอร์ตรงจุดนั้น',
      hi: 'घुमावदार पॉलीलाइन पर टैप करने से उसी जगह मार्कर लग जाता है।',
    },
  ),
  intro(
    'polygon',
    {
      en: 'Drag a vertex marker to reshape the polygon.',
      ja: '頂点のマーカーをドラッグすると形が変わります。',
      'es-419': 'Arrastra un vértice para remodelar el polígono.',
      de: 'Ziehen Sie einen Eckpunkt-Marker, um das Polygon umzuformen.',
      th: 'ลากมาร์กเกอร์จุดยอดเพื่อเปลี่ยนรูปทรงของโพลีกอน',
      hi: 'किसी शीर्ष मार्कर को खींचने से पॉलीगॉन का आकार बदलता है।',
    },
  ),
  intro(
    'polygon-click',
    {
      en: 'Tap inside or outside the polygon to test the point.',
      ja: 'ポリゴンの内側・外側をタップして判定を確認しましょう。',
      'es-419': 'Toca dentro o fuera del polígono para comprobar el punto.',
      de: 'Tippen Sie innerhalb oder außerhalb des Polygons, um den Punkt zu prüfen.',
      th: 'แตะด้านในหรือด้านนอกโพลีกอนเพื่อทดสอบจุดนั้น',
      hi: 'पॉलीगॉन के अंदर या बाहर टैप करके बिंदु की जाँच करें।',
    },
  ),
  intro(
    'polygon-geodesic',
    {
      en: 'Zoom out to see the geodesic edges curve.',
      ja: 'ズームアウトすると測地線の辺が湾曲して見えます。',
      'es-419': 'Aleja el zoom para ver curvarse los bordes geodésicos.',
      de: 'Zoomen Sie heraus, um die geodätischen Kanten sich krümmen zu sehen.',
      th: 'ซูมออกเพื่อดูขอบแบบจีโอเดสิกโค้งขึ้น',
      hi: 'ज़ूम आउट करने पर जियोडेसिक भुजाएँ मुड़ी हुई दिखती हैं।',
    },
  ),
  intro(
    'polygon-hole',
    {
      en: 'Drag a hole vertex to reshape the cut-out.',
      ja: '穴の頂点をドラッグすると切り抜きの形が変わります。',
      'es-419': 'Arrastra un vértice del hueco para remodelar el recorte.',
      de: 'Ziehen Sie einen Loch-Eckpunkt, um die Aussparung umzuformen.',
      th: 'ลากจุดยอดของรูเพื่อเปลี่ยนรูปของส่วนที่เจาะ',
      hi: 'छेद का शीर्ष खींचने से कटे हुए हिस्से का आकार बदलता है।',
    },
  ),
  intro(
    'ground-image',
    {
      en: 'Drag a corner marker to move the image bounds.',
      ja: '隅のマーカーをドラッグすると画像の範囲が変わります。',
      'es-419': 'Arrastra un marcador de esquina para mover los límites de la imagen.',
      de: 'Ziehen Sie einen Eck-Marker, um die Bildgrenzen zu verschieben.',
      th: 'ลากมาร์กเกอร์ที่มุมเพื่อย้ายขอบเขตของภาพ',
      hi: 'कोने का मार्कर खींचने से इमेज की सीमा खिसकती है।',
    },
  ),
  intro(
    'raster-layer',
    {
      en: 'Adjust the opacity control to fade the raster tiles.',
      ja: '透明度を変えるとラスタータイルが透けます。',
      'es-419': 'Ajusta la opacidad para atenuar los mosaicos ráster.',
      de: 'Verstellen Sie den Deckkraftregler, um die Rasterkacheln auszublenden.',
      th: 'ปรับแถบความทึบเพื่อให้ไทล์ราสเตอร์จางลง',
      hi: 'अपारदर्शिता का कंट्रोल घुमाने से रास्टर टाइल फीकी पड़ती हैं।',
    },
  ),
  intro(
    'info-bubble-simple',
    {
      en: 'Tap the marker to open its bubble.',
      ja: 'マーカーをタップすると吹き出しが開きます。',
      'es-419': 'Toca el marcador para abrir su globo.',
      de: 'Tippen Sie den Marker an, um seine Sprechblase zu öffnen.',
      th: 'แตะมาร์กเกอร์เพื่อเปิดบับเบิล',
      hi: 'मार्कर पर टैप करने से उसका बबल खुलता है।',
    },
  ),
  intro(
    'info-bubble-styled',
    {
      en: 'Tap a marker to open the custom-styled bubble.',
      ja: 'マーカーをタップするとカスタムデザインの吹き出しが開きます。',
      'es-419': 'Toca un marcador para abrir el globo personalizado.',
      de: 'Tippen Sie einen Marker an, um die eigens gestaltete Sprechblase zu öffnen.',
      th: 'แตะมาร์กเกอร์เพื่อเปิดบับเบิลที่จัดสไตล์เอง',
      hi: 'किसी मार्कर पर टैप करने से अपनी स्टाइल वाला बबल खुलता है।',
    },
  ),
  intro(
    'info-bubble-multiple',
    {
      en: 'Tap several markers to open multiple bubbles at once.',
      ja: '複数のマーカーをタップすると吹き出しが同時に開きます。',
      'es-419': 'Toca varios marcadores para abrir varios globos a la vez.',
      de: 'Tippen Sie mehrere Marker an, um mehrere Sprechblasen gleichzeitig zu öffnen.',
      th: 'แตะมาร์กเกอร์หลายอันเพื่อเปิดบับเบิลพร้อมกันหลายอัน',
      hi: 'कई मार्कर पर टैप करने से एक साथ कई बबल खुलते हैं।',
    },
  ),
  intro(
    'info-bubble-rich',
    {
      en: 'Tap the button inside the bubble to interact with it.',
      ja: '吹き出し内のボタンをタップして操作してみましょう。',
      'es-419': 'Toca el botón dentro del globo para interactuar con él.',
      de: 'Tippen Sie die Schaltfläche in der Sprechblase an, um mit ihr zu arbeiten.',
      th: 'แตะปุ่มภายในบับเบิลเพื่อโต้ตอบกับบับเบิล',
      hi: 'बबल के अंदर के बटन पर टैप करके उससे काम करें।',
    },
  ),
  intro(
    'geojson-basic',
    {
      en: 'Pan and zoom to explore the GeoJSON features.',
      ja: '地図を動かして GeoJSON の Feature を見てみましょう。',
      'es-419': 'Desplaza y haz zoom para explorar los elementos GeoJSON.',
      de: 'Verschieben und zoomen Sie, um die GeoJSON-Features zu erkunden.',
      th: 'เลื่อนและซูมเพื่อสำรวจฟีเจอร์ของ GeoJSON',
      hi: 'खिसकाकर और ज़ूम करके GeoJSON के फ़ीचर देखें।',
    },
  ),
  intro(
    'geojson-layer',
    {
      en: 'Tap a feature to see its properties.',
      ja: 'Feature をタップすると属性が表示されます。',
      'es-419': 'Toca un elemento para ver sus propiedades.',
      de: 'Tippen Sie ein Feature an, um seine Eigenschaften zu sehen.',
      th: 'แตะฟีเจอร์เพื่อดูคุณสมบัติของฟีเจอร์นั้น',
      hi: 'किसी फ़ीचर पर टैप करने से उसकी प्रॉपर्टी दिखती हैं।',
    },
  ),
  intro(
    'kml-layer',
    {
      en: 'Tap a feature to see its properties.',
      ja: 'Feature をタップすると属性が表示されます。',
      'es-419': 'Toca un elemento para ver sus propiedades.',
      de: 'Tippen Sie ein Feature an, um seine Eigenschaften zu sehen.',
      th: 'แตะฟีเจอร์เพื่อดูคุณสมบัติของฟีเจอร์นั้น',
      hi: 'किसी फ़ीचर पर टैप करने से उसकी प्रॉपर्टी दिखती हैं।',
    },
  ),
  intro(
    'heatmap-layer',
    {
      en: 'Zoom in and out to see the density change.',
      ja: 'ズームすると密度の表示が変化します。',
      'es-419': 'Acerca y aleja para ver cambiar la densidad.',
      de: 'Zoomen Sie hinein und heraus, um die Dichte sich ändern zu sehen.',
      th: 'ซูมเข้าออกเพื่อดูความหนาแน่นเปลี่ยนไป',
      hi: 'ज़ूम इन और आउट करने पर घनत्व बदलता दिखता है।',
    },
  ),
  intro(
    'threejs-object',
    {
      en: 'Move the map; the 3D object stays pinned in place.',
      ja: '地図を動かしても 3D オブジェクトは同じ地点に固定されます。',
      'es-419': 'Mueve el mapa; el objeto 3D permanece fijo en su lugar.',
      de: 'Bewegen Sie die Karte — das 3D-Objekt bleibt an seinem Ort verankert.',
      th: 'เลื่อนแผนที่ แล้วอ็อบเจกต์ 3D จะยังตรึงอยู่ที่เดิม',
      hi: 'मैप हिलाइए — 3D ऑब्जेक्ट अपनी जगह टिका रहता है।',
    },
  ),
]);

/**
 * In-memory record of which pages have already shown their intro. Module state
 * survives SPA navigation but is re-initialized on a full page reload, so each
 * page's intro appears once per reload and never again until the user reloads.
 */
const shownPages = new Set<string>();

export function hasSeenIntro(page: string): boolean {
  return shownPages.has(page);
}

export function markIntroSeen(page: string): void {
  shownPages.add(page);
}

export function getSampleIntro(page: string | undefined): SampleIntro | null {
  return (page && INTROS[page]) || null;
}
