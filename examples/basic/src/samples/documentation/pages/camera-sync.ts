import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `const syncCamera = (
  source: 'left' | 'right',
  camera: MapCameraPosition,
) => {
  const targetState = source === 'left' ? rightMapState : leftMapState;
  const targetGuard = source === 'left' ? rightProgrammatic : leftProgrammatic;
  if (targetGuard.current) return;

  targetGuard.current = true;
  targetState.moveCameraTo(camera, 0);
  requestAnimationFrame(() => { targetGuard.current = false; });
};

<div className="camera-grid">
  <MapLibreMapView
    state={leftMapState}
    onCameraMove={camera => syncCamera('left', camera)}
  />
  <LeafletMapView
    state={rightMapState}
    onCameraMove={camera => syncCamera('right', camera)}
  />
</div>`,
  state: `const leftMapState = useMapLibreViewState({
  mapDesignType: MapLibreDesign.OsmBrightJa,
  cameraPosition: initialCamera,
});
const rightMapState = useLeafletMapViewState({
  mapDesignType: LeafletDesign.OpenStreetMap,
  cameraPosition: initialCamera,
});
const leftProgrammatic = useRef(false);
const rightProgrammatic = useRef(false);`,
  explanation: {
    en: [
      'Forward camera changes between two independently rendered providers while suppressing feedback loops.',
      'This page intentionally runs two providers at once: useMapLibreViewState and useLeafletMapViewState each build a separate view state that starts from the same initialCamera.',
      "syncCamera copies one map's camera onto the other with moveCameraTo(camera, 0), and a useRef guard released on the next requestAnimationFrame stops the mirrored update from echoing back.",
    ],
    ja: [
      '独立して描画した2つのプロバイダー間でカメラ変更を転送し、相互更新のループを抑制します。',
      'このページだけは2種類のプロバイダーを同時に使います。useMapLibreViewState と useLeafletMapViewState が同じ initialCamera から別々の ViewState を作ります。',
      'syncCamera は一方のカメラを moveCameraTo(camera, 0) でもう一方へ転写し、useRef のガードを次の requestAnimationFrame で解除することで、転写した更新が跳ね返るのを防ぎます。',
    ],
    'es-419': [
      'Transfiere los cambios de cámara entre dos proveedores renderizados de forma independiente y evita ciclos de actualización.',
      'Esta página usa dos proveedores a la vez a propósito: useMapLibreViewState y useLeafletMapViewState crean cada uno un estado de vista separado que parte de la misma initialCamera.',
      'syncCamera copia la cámara de un mapa sobre el otro con moveCameraTo(camera, 0), y un guard con useRef liberado en el siguiente requestAnimationFrame impide que la actualización reflejada rebote.',
    ],
    de: [
      'Kameraänderungen zwischen zwei unabhängig gerenderten Anbietern weiterreichen und dabei Rückkopplungsschleifen unterdrücken.',
      'Diese Seite betreibt bewusst zwei Anbieter gleichzeitig: useMapLibreViewState und useLeafletMapViewState bauen je einen eigenen View-State auf, der von derselben initialCamera ausgeht.',
      'syncCamera überträgt die Kamera der einen Karte mit moveCameraTo(camera, 0) auf die andere, und eine useRef-Sperre, die erst im nächsten requestAnimationFrame gelöst wird, verhindert, dass die gespiegelte Aktualisierung zurückhallt.',
    ],
    th: [
      'ส่งต่อการเปลี่ยนแปลงของกล้องระหว่างผู้ให้บริการสองรายที่เรนเดอร์แยกกัน พร้อมกันไม่ให้เกิดลูปป้อนกลับ',
      'หน้านี้ตั้งใจให้ผู้ให้บริการสองรายทำงานพร้อมกัน โดย useMapLibreViewState และ useLeafletMapViewState ต่างสร้างสถานะมุมมองของตัวเองที่เริ่มจาก initialCamera เดียวกัน',
      'syncCamera คัดลอกกล้องของแผนที่ฝั่งหนึ่งไปยังอีกฝั่งด้วย moveCameraTo(camera, 0) และตัวกันด้วย useRef ที่ปลดใน requestAnimationFrame ถัดไปจะหยุดไม่ให้การอัปเดตที่สะท้อนกลับวนซ้ำ',
    ],
    hi: [
      'अलग-अलग रेंडर होने वाले दो प्रोवाइडर के बीच कैमरे के बदलाव आगे भेजें, और फ़ीडबैक लूप को रोकें।',
      'यह पेज जानबूझकर दो प्रोवाइडर एक साथ चलाता है: useMapLibreViewState और useLeafletMapViewState दोनों अपना-अपना व्यू स्टेट बनाते हैं, जो एक ही initialCamera से शुरू होता है।',
      'syncCamera एक मैप का कैमरा moveCameraTo(camera, 0) से दूसरे पर उतार देता है, और अगले requestAnimationFrame पर छूटने वाला useRef का पहरा उस नकल हुए अपडेट को वापस गूँजने नहीं देता।',
    ],
  },
};

export default doc;
