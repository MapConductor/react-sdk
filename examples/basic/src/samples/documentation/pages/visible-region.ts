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
  },
};

export default doc;
