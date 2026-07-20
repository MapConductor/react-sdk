const labels: Record<string, string> = {
  N02_001: '鉄道区分', N02_002: '事業者種別', N02_003: '路線名', N02_004: '運営会社',
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
