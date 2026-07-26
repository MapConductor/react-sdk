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
  },
};

export default doc;
