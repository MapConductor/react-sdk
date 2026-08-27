import { useSampleI18n, type Phrase } from '../../../samples/i18n';

/**
 * 国土数値情報の鉄道データ（N02）の属性名。
 *
 * 生の `N02_001` のままだと何の値か分からないので、吹き出しでは名前に置き換える。
 * android / ios と**同じ文言**にしてある（3 プラットフォームを並べて見比べるサンプルなので、
 * ここが違うと同じ地物を選んでいるのか判断できない）。
 *
 * ここに無いキーは生のキー名をそのまま出す。データ側に属性が増えても表から消えないように。
 */
const labels: Record<string, Phrase> = {
  N02_001: { en: 'Railway category', ja: '鉄道区分', 'es-419': 'Categoría de ferrocarril', de: 'Bahnkategorie', th: 'ประเภทรถไฟ', hi: 'रेलवे श्रेणी' },
  N02_002: { en: 'Business category', ja: '事業者区分', 'es-419': 'Categoría de operador', de: 'Betreiberkategorie', th: 'ประเภทผู้ประกอบการ', hi: 'संचालक श्रेणी' },
  N02_003: { en: 'Railway name', ja: '路線名', 'es-419': 'Nombre de la línea', de: 'Streckenname', th: 'ชื่อเส้นทาง', hi: 'लाइन का नाम' },
  N02_004: { en: 'Railway company', ja: '運営会社', 'es-419': 'Empresa operadora', de: 'Betreibergesellschaft', th: 'บริษัทผู้ให้บริการ', hi: 'संचालक कंपनी' },
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
 * 見出しは表示言語で出す。値の方は日本語か英語しか無い ── geojson が
 * `N02_003` に対して `N02_003_en` を持っているだけで、独語・タイ語・
 * ヒンディー語の対訳はデータ側に無い。なので日本語以外は `_en` の側へ
 * 差し替え、`_en` の行そのものは出さない（同じ項目が 2 行に増えるため）。
 */
export function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
  const { language, t } = useSampleI18n();
  const ja = language === 'ja';
  const entries = Object.entries(properties).filter(([key]) => !key.endsWith(ENGLISH_SUFFIX));
  if (entries.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 13 }}>
        {t({ en: 'No properties', ja: 'プロパティなし', 'es-419': 'Sin propiedades', de: 'Keine Eigenschaften', th: 'ไม่มีคุณสมบัติ', hi: 'कोई प्रॉपर्टी नहीं' })}
      </p>
    );
  }
  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 220 }}>
      <thead><tr style={{ background: '#e0e0e0' }}>
        <th style={cellStyle}>{t({ en: 'Property', ja: 'プロパティ', 'es-419': 'Propiedad', de: 'Eigenschaft', th: 'คุณสมบัติ', hi: 'प्रॉपर्टी' })}</th>
        <th style={cellStyle}>{t({ en: 'Value', ja: '値', 'es-419': 'Valor', de: 'Wert', th: 'ค่า', hi: 'मान' })}</th>
      </tr></thead>
      <tbody>{entries.map(([key, value]) => {
        const shown = ja ? value : properties[key + ENGLISH_SUFFIX] ?? value;
        return <tr key={key}>
          <td style={cellStyle}>{labels[key] ? t(labels[key]) : key}</td>
          <td style={cellStyle}>{shown == null ? '' : String(shown)}</td>
        </tr>;
      })}</tbody>
    </table>
  );
}
