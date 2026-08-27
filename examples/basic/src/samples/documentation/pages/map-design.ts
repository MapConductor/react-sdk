import type { SamplePageDoc } from '../types';

const doc: SamplePageDoc = {
  code: `const handleDesignChange = (designId: string) => {
  const option = mapDesignOptions.find(item => item.design.id === designId);
  if (!option) return;
  mapViewState.mapDesignType = option.design;
  setSelectedDesignId(String(option.design.id));
};

<MapViewContainer state={mapViewState}>
  <select
    value={selectedDesignId}
    onChange={event => handleDesignChange(event.target.value)}
  >
    {mapDesignOptions.map(option => (
      <option key={String(option.design.id)} value={String(option.design.id)}>
        {option.label}
      </option>
    ))}
  </select>
</MapViewContainer>`,
  state: `const mapDesignOptions = providerDesignOptions;
const [selectedDesignId, setSelectedDesignId] = useState(
  String(mapViewState.mapDesignType.id),
);`,
  explanation: {
    en: [
      'Change the abstract map design on the view state, and let each provider resolve it to its corresponding native style.',
      "The mapDesignOptions come from the active provider's design list, and selectedDesignId mirrors mapViewState.mapDesignType.id so the <select> stays a controlled component.",
      'handleDesignChange finds the chosen option and assigns option.design to mapViewState.mapDesignType; the provider then swaps to the matching native style without rebuilding the map.',
    ],
    ja: [
      '抽象的な地図デザインを ViewState へ設定し、各プロバイダーに対応するネイティブスタイルへ変換させます。',
      'mapDesignOptions は使用中プロバイダーのデザイン一覧から取得し、selectedDesignId は mapViewState.mapDesignType.id を反映するため <select> は制御コンポーネントとして動作します。',
      'handleDesignChange は選択されたオプションを探し、option.design を mapViewState.mapDesignType へ代入します。プロバイダーはそのデザインを地図を作り直さずに対応スタイルへ切り替えます。',
    ],
    'es-419': [
      'Cambia el diseño abstracto del mapa en el estado de la vista y deja que cada proveedor lo convierta a su estilo nativo correspondiente.',
      'Las mapDesignOptions provienen de la lista de diseños del proveedor activo y selectedDesignId refleja mapViewState.mapDesignType.id para que el <select> siga siendo un componente controlado.',
      'handleDesignChange busca la opción elegida y asigna option.design a mapViewState.mapDesignType; el proveedor cambia entonces al estilo nativo equivalente sin reconstruir el mapa.',
    ],
    de: [
      'Das abstrakte Kartendesign am View-State ändern und jeden Anbieter es auf seinen entsprechenden nativen Stil auflösen lassen.',
      'Die mapDesignOptions stammen aus der Designliste des aktiven Anbieters, und selectedDesignId spiegelt mapViewState.mapDesignType.id, damit das <select> eine kontrollierte Komponente bleibt.',
      'handleDesignChange sucht die gewählte Option und weist option.design an mapViewState.mapDesignType zu; der Anbieter wechselt daraufhin zum passenden nativen Stil, ohne die Karte neu aufzubauen.',
    ],
    th: [
      'เปลี่ยนดีไซน์แผนที่เชิงนามธรรมบนสถานะมุมมอง แล้วให้ผู้ให้บริการแต่ละรายแปลงเป็นสไตล์เนทีฟของตน',
      'mapDesignOptions มาจากรายการดีไซน์ของผู้ให้บริการที่ใช้อยู่ และ selectedDesignId สะท้อน mapViewState.mapDesignType.id เพื่อให้ <select> ยังเป็นคอมโพเนนต์แบบควบคุม',
      'handleDesignChange หาตัวเลือกที่เลือกแล้วกำหนด option.design ให้ mapViewState.mapDesignType จากนั้นผู้ให้บริการจะสลับไปใช้สไตล์เนทีฟที่ตรงกันโดยไม่ต้องสร้างแผนที่ใหม่',
    ],
    hi: [
      'व्यू स्टेट पर अमूर्त मैप डिज़ाइन बदलें, और हर प्रोवाइडर को उसे अपने नेटिव स्टाइल में बदलने दें।',
      'mapDesignOptions चालू प्रोवाइडर की डिज़ाइन सूची से आते हैं, और selectedDesignId mapViewState.mapDesignType.id की नकल रखता है ताकि <select> नियंत्रित कंपोनेंट बना रहे।',
      'handleDesignChange चुना गया विकल्प ढूँढ़कर option.design को mapViewState.mapDesignType में डाल देता है; फिर प्रोवाइडर मैप दोबारा बनाए बिना उससे मेल खाते नेटिव स्टाइल पर चला जाता है।',
    ],
  },
};

export default doc;
