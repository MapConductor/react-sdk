import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<MapViewContainer
  state={mapViewState}
  onCameraMove={camera => setRegion(camera.visibleRegion)}
/>

<VisibleRegionValues region={region} />`,
  state: `const [region, setRegion] = useState<VisibleRegion | null>(null);`,
  explanation: {
    en: [
      'Read the provider-independent visible region from camera events, including its bounds and four corner coordinates.',
      'Each onCameraMove event carries a camera whose visibleRegion is saved into React state as a VisibleRegion value.',
      'VisibleRegionValues then prints that region’s bounds and its four corners, normalized so the same numbers appear on any provider.',
    ],
    ja: [
      'カメライベントから、境界と四隅の座標を含むプロバイダー非依存の表示領域を取得します。',
      'onCameraMove イベントが渡すカメラの visibleRegion を、VisibleRegion 値として React の state に保存します。',
      'VisibleRegionValues はその表示領域の境界と四隅を表示し、値は正規化されているためどのプロバイダーでも同じ数値になります。',
    ],
    'es-419': [
      'Obtiene de los eventos de cámara la región visible independiente del proveedor, incluidos sus límites y las cuatro esquinas.',
      'Cada evento onCameraMove lleva una cámara cuya visibleRegion se guarda en el estado de React como un valor VisibleRegion.',
      'VisibleRegionValues muestra entonces los límites de esa región y sus cuatro esquinas, normalizados para que aparezcan los mismos números en cualquier proveedor.',
    ],
    de: [
      'Den anbieterunabhängigen sichtbaren Bereich aus Kameraereignissen auslesen, samt seiner Grenzen und vier Eckkoordinaten.',
      'Jedes onCameraMove-Ereignis trägt eine camera, deren visibleRegion als VisibleRegion-Wert im React-State abgelegt wird.',
      'VisibleRegionValues gibt anschließend die Grenzen dieses Bereichs und seine vier Ecken aus — normalisiert, sodass bei jedem Anbieter dieselben Zahlen erscheinen.',
    ],
    th: [
      'อ่านพื้นที่ที่มองเห็นแบบไม่ผูกกับผู้ให้บริการจากเหตุการณ์ของกล้อง รวมถึงขอบเขตและพิกัดมุมทั้งสี่',
      'เหตุการณ์ onCameraMove แต่ละครั้งพก camera ที่มี visibleRegion ซึ่งจะถูกบันทึกลงสถานะของ React ในรูปค่า VisibleRegion',
      'จากนั้น VisibleRegionValues จะพิมพ์ขอบเขตของพื้นที่นั้นพร้อมมุมทั้งสี่ โดยปรับให้เป็นมาตรฐานเดียวกัน ตัวเลขจึงออกมาเหมือนกันบนผู้ให้บริการทุกเจ้า',
    ],
    hi: [
      'कैमरा इवेंट से प्रोवाइडर-निरपेक्ष दृश्य क्षेत्र पढ़ें — उसकी सीमा और चारों कोनों के निर्देशांक सहित।',
      'हर onCameraMove इवेंट एक camera लाता है, जिसका visibleRegion React स्टेट में VisibleRegion मान के रूप में सहेजा जाता है।',
      'फिर VisibleRegionValues उस क्षेत्र की सीमा और चारों कोने छापता है — सामान्यीकृत, ताकि किसी भी प्रोवाइडर पर वही अंक दिखें।',
    ],
  },
};

export default doc;
