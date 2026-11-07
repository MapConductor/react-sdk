import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  state: `const [enabled, setEnabled] = useState(true);
const restriction = useMemo(() => ({
  bounds: createGeoRectBounds({
    southWest: createGeoPoint({ latitude: 35.63, longitude: 139.70 }),
    northEast: createGeoPoint({ latitude: 35.75, longitude: 139.85 }),
  }),
  minZoom: 12, maxZoom: 16,
}), []);`,
  code: `<label><input type="checkbox" checked={enabled}
  onChange={event => setEnabled(event.target.checked)} /> Restrict camera</label>
<button onClick={() => mapViewState.moveCameraTo(createMapCameraPosition({
  position: createGeoPoint({ latitude: 34.69, longitude: 135.50 }), zoom: 8,
}), 0)}>Request an outside position</button>
<MapViewContainer state={mapViewState} cameraRestriction={enabled ? restriction : null} />`,
  explanation: {
    en: ['cameraRestriction limits the camera position and zoom. Toggle the restriction and request a position outside Tokyo to compare the behavior. Providers may reject the move or clamp it to the permitted range.'],
    ja: ['cameraRestriction で移動可能な範囲とズームの上下限を指定します。制限の有無を切り替え、範囲外への移動を試せます。プロバイダーによって、移動を拒否するか、許可範囲へ補正します。'],
    'es-419': ['cameraRestriction limita la posición y el zoom. Activa la restricción y solicita una posición fuera de Tokio. El proveedor puede rechazar el movimiento o ajustarlo al rango permitido.'],
    de: ['cameraRestriction begrenzt Position und Zoom. Schalten Sie die Begrenzung um und fordern Sie eine Position außerhalb Tokios an. Der Anbieter lehnt die Bewegung ab oder korrigiert sie auf den erlaubten Bereich.'],
    th: ['cameraRestriction จำกัดตำแหน่งและซูม ลองสลับข้อจำกัดและขอเคลื่อนที่ออกนอกโตเกียว ผู้ให้บริการอาจปฏิเสธการเคลื่อนที่หรือปรับกลับเข้าสู่ขอบเขตที่อนุญาต'],
    hi: ['cameraRestriction स्थिति और ज़ूम सीमित करता है। सीमा चालू करके टोक्यो के बाहर की स्थिति माँगें। प्रोवाइडर बदलाव रोक सकता है या अनुमत सीमा में सुधार सकता है।'],
  },
};
export default doc;
