import { useSampleI18n } from '../../../samples/i18n';

/**
 * 選択した KML プレースマークの属性（name / description / ExtendedData）を
 * そのまま並べる汎用の表。android-sdk の `KMLMapPage.kt` の PropertyTable と
 * 同じ Property / Value の 2 列構成。
 */
const cellStyle: React.CSSProperties = { border: '1px solid #bbb', padding: '4px 8px', color: '#222' };

export function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
  const { t } = useSampleI18n();
  const entries = Object.entries(properties);
  if (entries.length === 0) return <p style={{ margin: 0, fontSize: 13 }}>{t('No properties', 'プロパティなし', 'Sin propiedades')}</p>;
  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 220 }}>
      <thead><tr style={{ background: '#e0e0e0' }}>
        <th style={cellStyle}>{t('Property', 'プロパティ', 'Propiedad')}</th><th style={cellStyle}>{t('Value', '値', 'Valor')}</th>
      </tr></thead>
      <tbody>{entries.map(([key, value]) => (
        <tr key={key}>
          <td style={cellStyle}>{key}</td>
          <td style={cellStyle}>{value == null ? '' : String(value)}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
