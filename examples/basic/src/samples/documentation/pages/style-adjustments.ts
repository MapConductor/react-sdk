import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  state: `const [water, setWater] = useState('#3a7ca5');
const [hideBuildings, setHideBuildings] = useState(false);
const style = 'https://tiles.versatiles.org/assets/styles/colorful/style.json';
const rules = useMemo(() => buildStyleRules(r => {
  r.role(LayerRole.water, { colorFilter: { mix: { color: water, amount: 0.6 } } });
  r.role(LayerRole.building, { visible: !hideBuildings });
}), [water, hideBuildings]);`,
  code: `<label>Water <input type="color" value={water} onChange={e => setWater(e.target.value)} /></label>
<label><input type="checkbox" checked={hideBuildings}
  onChange={e => setHideBuildings(e.target.checked)} /> Hide buildings</label>
<MapViewContainer state={mapViewState}>
  <VectorTileLayer style={style} rules={rules} />
</MapViewContainer>`,
  explanation: {
    en: ['buildStyleRules targets layers by their semantic role. Changing the water color or building visibility rebuilds the rules and repaints the vector-tile overlay.'],
    ja: ['buildStyleRules は水域や建物といった役割でレイヤーを指定します。色や表示状態を変えると rules が再生成され、ベクタータイルの描画へ反映されます。'],
    'es-419': ['buildStyleRules selecciona capas por su función. Cambiar el color del agua o la visibilidad de edificios reconstruye las reglas y actualiza las teselas vectoriales.'],
    de: ['buildStyleRules wählt Ebenen nach ihrer Rolle aus. Änderungen an Wasserfarbe oder Gebäudesichtbarkeit erzeugen neue Regeln und aktualisieren die Vektorkacheln.'],
    th: ['buildStyleRules เลือกเลเยอร์ตามบทบาท การเปลี่ยนสีน้ำหรือการแสดงอาคารจะสร้างกฎใหม่และวาดเวกเตอร์ไทล์อีกครั้ง'],
    hi: ['buildStyleRules भूमिका से लेयर चुनता है। पानी का रंग या इमारतों की दृश्यता बदलने पर नियम फिर बनते हैं और वेक्टर टाइल अपडेट होती हैं।'],
  },
};
export default doc;
