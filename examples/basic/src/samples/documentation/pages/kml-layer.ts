import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer state={mapViewState} onMapClick={handleMapClick}>
  <KMLLayer state={layerState} features={features} />
  {selected && (
    <InfoBubble position={selected.position}>
      <PropertyTable properties={selected.properties} />
    </InfoBubble>
  )}
</MapViewContainer>`,
  state: `const [features, setFeatures] = useState<KMLFeatureData[]>([]);
const [selected, setSelected] = useState<SelectedFeature | null>(null);
const layerState = useMemo(() => new KMLLayerState({ /* fallback style */ }), []);

// Fetch the document (here: public/sample.kml) and parse it into features.
useEffect(() => {
  fetch('/sample.kml')
    .then(response => response.text())
    .then(text => setFeatures(KMLParser.parse(text)));
}, []);`,
  explanation: {
    en: [
      'Parse a KML document with KMLParser and render its placemarks — styled polygons, lines, and points — as a tiled overlay.',
      'KMLParser.parse takes the KML text, so fetch the document yourself first; KMLLoader.load takes a URL instead (anything fetch accepts — a same-origin path such as /sample.kml or an absolute https URL), follows <NetworkLink> references and unpacks KMZ archives. On the web that fetch is subject to CORS, so a cross-origin document loads only when its server sends Access-Control-Allow-Origin — otherwise serve it from your own origin or inject a proxying fetch through the KMLLoader constructor.',
      'Both the features and the selected feature live in React state, and layerState is a KMLLayerState whose style is the fallback used when a placemark carries no KML <Style>.',
      "handleMapClick resolves which feature was hit and stores it, then InfoBubble anchors a PropertyTable of the placemark's name, description, and ExtendedData at the clicked coordinate.",
    ],
    ja: [
      'KML ドキュメントを KMLParser で解析し、スタイル付きのポリゴン・ライン・ポイントをタイルオーバーレイとして描画します。',
      'KMLParser.parse は KML テキストを受け取るので取得は自前で行います。KMLLoader.load なら URL を渡せます（fetch が引けるもの、例えば同一オリジンの /sample.kml や絶対 https URL）。こちらは <NetworkLink> の参照先も追跡し、KMZ も展開します。ただし web の取得は CORS の制約を受けるため、別オリジンの文書は配信側が Access-Control-Allow-Origin を返す場合にのみ読めます。返らない場合は自分のオリジンに置くか、KMLLoader の constructor で fetch を差し替えてプロキシ経由にしてください。',
      'features と選択中の Feature はどちらも React の state に保持し、layerState は KML の <Style> を持たないプレースマークに使う既定スタイルを持つ KMLLayerState です。',
      'handleMapClick がどの Feature に当たったかを判定して保存し、InfoBubble がプレースマークの name / description / ExtendedData の PropertyTable をクリック座標に固定します。',
    ],
    'es-419': [
      'Analiza un documento KML con KMLParser y renderiza sus placemarks — polígonos, líneas y puntos con estilo — como una superposición de mosaicos.',
      'KMLParser.parse recibe el texto KML, así que tú haces la descarga; KMLLoader.load recibe una URL (cualquiera que acepte fetch: una ruta del mismo origen como /sample.kml o una URL https absoluta), sigue las referencias <NetworkLink> y descomprime archivos KMZ. En la web esa descarga está sujeta a CORS: un documento de otro origen solo carga si su servidor envía Access-Control-Allow-Origin; si no, publícalo en tu propio origen o inyecta un fetch con proxy en el constructor de KMLLoader.',
      'Tanto los features como el elemento seleccionado viven en el estado de React, y layerState es un KMLLayerState cuyo estilo es el respaldo cuando un placemark no trae <Style> KML.',
      'handleMapClick determina qué elemento se tocó y lo almacena, luego InfoBubble ancla un PropertyTable con name, description y ExtendedData del placemark en la coordenada tocada.',
    ],
    de: [
      'Ein KML-Dokument mit KMLParser parsen und seine Placemarks — gestaltete Polygone, Linien und Punkte — als gekacheltes Overlay zeichnen.',
      'KMLParser.parse nimmt den KML-Text entgegen, das Dokument holen Sie also selbst; KMLLoader.load nimmt stattdessen eine URL (alles, was fetch akzeptiert — einen Pfad gleicher Herkunft wie /sample.kml oder eine absolute https-URL), folgt <NetworkLink>-Verweisen und packt KMZ-Archive aus. Im Web unterliegt dieses fetch CORS: Ein Dokument fremder Herkunft lädt nur, wenn sein Server Access-Control-Allow-Origin sendet — andernfalls liefern Sie es von Ihrer eigenen Herkunft aus oder geben dem KMLLoader-Konstruktor ein fetch mit Proxy mit.',
      'Sowohl die Features als auch das ausgewählte Feature liegen im React-State, und layerState ist ein KMLLayerState, dessen style einspringt, wenn ein Placemark keinen eigenen KML-<Style> trägt.',
      'handleMapClick ermittelt das getroffene Feature und merkt es sich, dann verankert InfoBubble eine PropertyTable mit Name, Beschreibung und ExtendedData des Placemarks an der angeklickten Koordinate.',
    ],
    th: [
      'แจงเอกสาร KML ด้วย KMLParser แล้วเรนเดอร์ placemark ทั้งโพลีกอน เส้น และจุดที่จัดสไตล์ไว้ ในรูปโอเวอร์เลย์แบบไทล์',
      'KMLParser.parse รับข้อความ KML จึงต้อง fetch เอกสารเองก่อน ส่วน KMLLoader.load รับ URL แทน (อะไรก็ได้ที่ fetch รับ ทั้งพาธต้นทางเดียวกันอย่าง /sample.kml หรือ URL https แบบเต็ม) ตามลิงก์ <NetworkLink> และแตกไฟล์ KMZ ให้ด้วย บนเว็บ การ fetch นั้นอยู่ใต้กฎ CORS เอกสารข้ามต้นทางจึงโหลดได้ก็ต่อเมื่อเซิร์ฟเวอร์ส่ง Access-Control-Allow-Origin มา ไม่เช่นนั้นให้เสิร์ฟจากต้นทางของคุณเอง หรือส่ง fetch ที่ผ่านพร็อกซีเข้าไปทางคอนสตรักเตอร์ของ KMLLoader',
      'ทั้งฟีเจอร์และฟีเจอร์ที่เลือกอยู่ในสถานะของ React ส่วน layerState คือ KMLLayerState ซึ่ง style ของมันจะถูกใช้เมื่อ placemark ไม่มี <Style> ของ KML เป็นของตัวเอง',
      'handleMapClick หาว่าโดนฟีเจอร์ใดแล้วเก็บไว้ จากนั้น InfoBubble จะตรึง PropertyTable ที่แสดงชื่อ คำอธิบาย และ ExtendedData ของ placemark ไว้ที่พิกัดที่คลิก',
    ],
    hi: [
      'KMLParser से एक KML दस्तावेज़ पढ़ें और उसके placemark — सजाए हुए पॉलीगॉन, रेखाएँ और बिंदु — टाइल वाले ओवरले के रूप में रेंडर करें।',
      'KMLParser.parse KML का टेक्स्ट लेता है, इसलिए दस्तावेज़ आपको खुद fetch करना होता है; KMLLoader.load उसकी जगह URL लेता है (जो कुछ भी fetch स्वीकार करे — /sample.kml जैसा समान-मूल पथ या पूरा https URL), <NetworkLink> संदर्भों का पीछा करता है और KMZ संग्रह खोल देता है। वेब पर वह fetch CORS के अधीन है, इसलिए दूसरे मूल का दस्तावेज़ तभी लोड होता है जब उसका सर्वर Access-Control-Allow-Origin भेजे — वरना उसे अपने ही मूल से परोसें, या KMLLoader के कंस्ट्रक्टर में प्रॉक्सी करने वाला fetch दे दें।',
      'फ़ीचर और चुना गया फ़ीचर दोनों React स्टेट में रहते हैं, और layerState एक KMLLayerState है जिसका style तब काम आता है जब किसी placemark के पास अपना KML <Style> न हो।',
      'handleMapClick तय करता है कि कौन-सा फ़ीचर लगा और उसे रख लेता है; फिर InfoBubble उस placemark के नाम, विवरण और ExtendedData की PropertyTable क्लिक किए गए निर्देशांक पर टिका देता है।',
    ],
  },
};

export default doc;
