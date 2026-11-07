import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  state: `const bounds = useMemo(() => createGeoRectBounds({
  southWest: createGeoPoint({ latitude: 35.66, longitude: 139.74 }),
  northEast: createGeoPoint({ latitude: 35.70, longitude: 139.80 }),
}), []);
const marker = useMemo(() => createMarkerState({
  position: createGeoPoint({ latitude: 35.68, longitude: 139.76 }),
  draggable: true,
  onDragStart: state => {
    bounds.southWest = state.position;
    bounds.northEast = state.position;
  },
  onDragEnd: state => {
    bounds.extend(state.position);
    mapViewState.fitBounds(bounds, 40);
  },
}), [bounds, mapViewState]);`,
  code: `<button onClick={() => mapViewState.fitBounds(bounds, 40)}>Fit bounds</button>
<MapViewContainer state={mapViewState}>
  <Marker state={marker} />
</MapViewContainer>`,
  explanation: {
    en: ['fitBounds adjusts the camera to a geographic rectangle with 40 pixels of padding. Drag the marker to fit the rectangle between its start and end positions.'],
    ja: ['fitBounds は指定した矩形が収まるようにカメラを調整します。第2引数は余白のピクセル数です。マーカーをドラッグすると、開始位置と終了位置を含む範囲へ移動します。'],
    'es-419': ['fitBounds ajusta la cámara a un rectángulo geográfico con 40 píxeles de margen. Arrastra el marcador para ajustar el rectángulo entre el inicio y el final del movimiento.'],
    de: ['fitBounds passt die Kamera mit 40 Pixeln Rand an ein geografisches Rechteck an. Ziehen Sie den Marker, um den Bereich zwischen Start und Ende einzupassen.'],
    th: ['fitBounds ปรับกล้องให้ครอบคลุมสี่เหลี่ยมภูมิศาสตร์พร้อมขอบ 40 พิกเซล ลากมาร์กเกอร์เพื่อปรับให้พอดีกับพื้นที่ระหว่างจุดเริ่มต้นและจุดสิ้นสุด'],
    hi: ['fitBounds कैमरे को 40 पिक्सेल के अंतर के साथ भौगोलिक आयत में फ़िट करता है। मार्कर खींचने पर आरंभ और अंत के बीच का क्षेत्र दिखता है।'],
  },
};
export default doc;
