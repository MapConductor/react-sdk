import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  state: `const [settings, setSettings] = useState({ ...MapUISettings.Default });
const gestures = ['scrollGesture', 'zoomGesture', 'rotateGesture', 'tiltGesture'] as const;`,
  code: `{gestures.map(key => (
  <label key={key}>
    <input type="checkbox" checked={settings[key]} onChange={event => {
      const next = { ...settings, [key]: event.target.checked };
      setSettings(next);
      mapViewState.uiSettings = next;
    }} /> {key}
  </label>
))}
<MapViewContainer state={mapViewState} />`,
  explanation: {
    en: ['Assign a complete settings object to mapViewState.uiSettings to control pan, zoom, rotation and tilt gestures. A provider that cannot implement a setting logs a warning.'],
    ja: ['mapViewState.uiSettings に設定オブジェクトを代入すると、スクロール・ズーム・回転・傾きのジェスチャを切り替えられます。対応できない設定はプロバイダーが警告を出します。'],
    'es-419': ['Asigna un objeto completo a mapViewState.uiSettings para controlar los gestos de desplazamiento, zoom, rotación e inclinación. Si una opción no está disponible, el proveedor muestra una advertencia.'],
    de: ['Weisen Sie mapViewState.uiSettings ein vollständiges Objekt zu, um Verschieben, Zoom, Drehen und Neigen zu steuern. Nicht unterstützte Einstellungen meldet der Anbieter als Warnung.'],
    th: ['กำหนดออบเจ็กต์การตั้งค่าให้ mapViewState.uiSettings เพื่อควบคุมการเลื่อน ซูม หมุน และเอียง ผู้ให้บริการจะแจ้งเตือนเมื่อไม่รองรับการตั้งค่านั้น'],
    hi: ['पैन, ज़ूम, घुमाव और झुकाव के जेस्चर नियंत्रित करने के लिए mapViewState.uiSettings को पूरा सेटिंग ऑब्जेक्ट दें। असमर्थित सेटिंग पर प्रोवाइडर चेतावनी देता है।'],
  },
};
export default doc;
