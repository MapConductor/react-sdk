import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
  <div onPointerDown={() => { activeMap.current = 'left'; }}
    onWheel={() => { activeMap.current = 'left'; }} onFocusCapture={() => { activeMap.current = 'left'; }}>
    <MapLibreMapView2D state={leftMapState}
      onCameraMove={camera => syncCamera('left', camera)} />
  </div>
  <div onPointerDown={() => { activeMap.current = 'right'; }}
    onWheel={() => { activeMap.current = 'right'; }} onFocusCapture={() => { activeMap.current = 'right'; }}>
    <LeafletMapView state={rightMapState}
      onCameraMove={camera => syncCamera('right', camera)} />
  </div>
</div>`,
  state: `const leftMapState = useMapLibreViewState({
  mapDesignType: MapLibreDesign.OsmBrightJa,
  cameraPosition: initialCamera,
});
const rightMapState = useLeafletMapViewState({
  mapDesignType: LeafletDesign.OpenStreetMap,
  cameraPosition: initialCamera,
});
// Only the map being manipulated forwards camera events. Mirrored events cannot echo.
const activeMap = useRef<'left' | 'right' | null>(null);
const syncCamera = (source: 'left' | 'right', camera: MapCameraPosition) => {
  if (activeMap.current !== source) return;
  const targetState = source === 'left' ? rightMapState : leftMapState;
  targetState.moveCameraTo(createMapCameraPosition({ position: camera.position, zoom: camera.zoom }), 0);
};`,
  explanation: {
    'en': [
      'Forward camera changes between MapLibre and Leaflet without a feedback loop.',
      'activeMap records which map receives pointer input. Only that map forwards its position and zoom with moveCameraTo; events from the other map are ignored.',
    ],
    'ja': [
      'MapLibre と Leaflet の間でカメラ位置とズームを同期します。',
      'ポインター操作を受けた地図を activeMap に記録し、その地図のカメライベントだけを転送します。移動先から返るイベントは転送しないため、相互更新がループしません。',
    ],
    'es-419': [
      'Sincroniza la posición y el zoom entre MapLibre y Leaflet.',
      'activeMap registra el mapa que recibe la entrada del puntero. Solo ese mapa envía cambios mediante moveCameraTo; se ignoran los eventos del otro mapa.',
    ],
    'de': [
      'Position und Zoom zwischen MapLibre und Leaflet synchronisieren.',
      'activeMap merkt sich die Karte mit der Zeigereingabe. Nur diese Karte leitet Änderungen mit moveCameraTo weiter; Ereignisse der anderen Karte werden ignoriert.',
    ],
    'th': [
      'ซิงก์ตำแหน่งและระดับซูมระหว่าง MapLibre กับ Leaflet',
      'activeMap บันทึกแผนที่ที่รับการควบคุมจากตัวชี้ เฉพาะแผนที่นั้นจะส่งการเปลี่ยนแปลงด้วย moveCameraTo และละเว้นเหตุการณ์จากอีกแผนที่',
    ],
    'hi': [
      'MapLibre और Leaflet के बीच स्थिति और ज़ूम सिंक करें।',
      'activeMap पॉइंटर इनपुट पाने वाला मैप याद रखता है। सिर्फ़ वही मैप moveCameraTo से बदलाव भेजता है; दूसरे मैप के इवेंट अनदेखे होते हैं।',
    ],
  },
};

export default doc;
