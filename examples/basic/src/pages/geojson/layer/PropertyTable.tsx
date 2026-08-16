import { useSampleI18n } from '../../../samples/i18n';

/**
 * 国土数値情報の鉄道データ（N02）の属性名。
 *
 * 生の `N02_001` のままだと何の値か分からないので、吹き出しでは名前に置き換える。
 * android / ios と**同じ文言**にしてある（3 プラットフォームを並べて見比べるサンプルなので、
 * ここが違うと同じ地物を選んでいるのか判断できない）。
 *
 * ここに無いキーは生のキー名をそのまま出す。データ側に属性が増えても表から消えないように。
 */
const labels: Record<string, { ja: string; en: string }> = {
  N02_001: { ja: '鉄道区分', en: 'Railway category' },
  N02_002: { ja: '事業者区分', en: 'Business category' },
  N02_003: { ja: '路線名', en: 'Railway name' },
  N02_004: { ja: '運営会社', en: 'Railway company' },
};

/**
 * 値の英語表記が入っている属性の接尾辞。
 *
 * geojson 側が `N02_003`（路線名）に対して `N02_003_en` を持っている。アプリに
 * 対訳表を置くと 4 プラットフォーム分そろえる羽目になるので、データに持たせてある。
 */
const ENGLISH_SUFFIX = '_en';

const cellStyle: React.CSSProperties = { border: '1px solid #bbb', padding: '4px 8px', color: '#222' };

/**
 * 表示言語が日本語なら日本語、それ以外は英語で出す。
 * 英語のときは値も `N02_003_en` の側へ差し替え、`_en` の行そのものは出さない
 * （同じ項目が 2 行に増えてしまうため）。
 */
export function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
  const { language } = useSampleI18n();
  const ja = language === 'ja';
  const entries = Object.entries(properties).filter(([key]) => !key.endsWith(ENGLISH_SUFFIX));
  if (entries.length === 0) return <p style={{ margin: 0, fontSize: 13 }}>{ja ? 'プロパティなし' : 'No properties'}</p>;
  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 220 }}>
      <thead><tr style={{ background: '#e0e0e0' }}>
        <th style={cellStyle}>{ja ? 'プロパティ' : 'Property'}</th><th style={cellStyle}>{ja ? '値' : 'Value'}</th>
      </tr></thead>
      <tbody>{entries.map(([key, value]) => {
        const shown = ja ? value : properties[key + ENGLISH_SUFFIX] ?? value;
        return <tr key={key}>
          <td style={cellStyle}>{(ja ? labels[key]?.ja : labels[key]?.en) ?? key}</td>
          <td style={cellStyle}>{shown == null ? '' : String(shown)}</td>
        </tr>;
      })}</tbody>
    </table>
  );
}
