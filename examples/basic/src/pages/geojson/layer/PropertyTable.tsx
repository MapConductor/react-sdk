/**
 * 国土数値情報の鉄道データ（N02）の属性名。
 *
 * 生の `N02_001` のままだと何の値か分からないので、吹き出しでは日本語名に置き換える。
 * android / ios と**同じ文言**にしてある（3 プラットフォームを並べて見比べるサンプルなので、
 * ここが違うと同じ地物を選んでいるのか判断できない）。
 *
 * ここに無いキーは生のキー名をそのまま出す。データ側に属性が増えても表から消えないように。
 */
const labels: Record<string, string> = {
  N02_001: '鉄道区分(railway category)',
  N02_002: '事業者区分(business category)',
  N02_003: '路線名(railway name)',
  N02_004: '運営会社(railway company)',
};
const cellStyle: React.CSSProperties = { border: '1px solid #bbb', padding: '4px 8px', color: '#222' };

export function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
  const entries = Object.entries(properties);
  if (entries.length === 0) return <p style={{ margin: 0, fontSize: 13 }}>プロパティなし</p>;
  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 220 }}>
      <thead><tr style={{ background: '#e0e0e0' }}><th style={cellStyle}>プロパティ</th><th style={cellStyle}>値</th></tr></thead>
      <tbody>{entries.map(([key, value]) => <tr key={key}>
        <td style={cellStyle}>{labels[key] ?? key}</td><td style={cellStyle}>{value == null ? '' : String(value)}</td>
      </tr>)}</tbody>
    </table>
  );
}
