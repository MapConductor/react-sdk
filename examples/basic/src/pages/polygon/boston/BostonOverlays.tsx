import { useSampleI18n } from '../../../samples/i18n';
import type { LandUse, LoadProgress } from './bostonData';

type Label = { en: string; ja: string; 'es-419': string; de: string; th: string; hi: string };

/** Land use of a parcel (Property Assessment `LU`, grouped) and how it is drawn. */
export const LAND_USE_STYLES: Record<LandUse, { fill: string; label: Label }> = {
  family: {
    fill: 'rgba(250, 204, 21, 0.55)',
    label: { en: '1–3 family', ja: '戸建て・2〜3 世帯', 'es-419': '1 a 3 familias', de: '1–3 Familien', th: 'บ้าน 1–3 ครอบครัว', hi: '1–3 परिवार' },
  },
  apartment: {
    fill: 'rgba(249, 115, 22, 0.55)',
    label: { en: 'Apartments', ja: '集合住宅', 'es-419': 'Departamentos', de: 'Mehrfamilienhaus', th: 'อพาร์ตเมนต์', hi: 'अपार्टमेंट' },
  },
  condo: {
    fill: 'rgba(236, 72, 153, 0.5)',
    label: { en: 'Condominium', ja: '区分所有', 'es-419': 'Condominio', de: 'Eigentumswohnungen', th: 'คอนโดมิเนียม', hi: 'कॉन्डोमिनियम' },
  },
  mixed: {
    fill: 'rgba(168, 85, 247, 0.5)',
    label: { en: 'Residential + commercial', ja: '住商併用', 'es-419': 'Residencial y comercial', de: 'Wohnen + Gewerbe', th: 'ที่อยู่อาศัยผสมพาณิชย์', hi: 'आवासीय + व्यावसायिक' },
  },
  commercial: {
    fill: 'rgba(239, 68, 68, 0.55)',
    label: { en: 'Commercial', ja: '商業', 'es-419': 'Comercial', de: 'Gewerbe', th: 'พาณิชย์', hi: 'व्यावसायिक' },
  },
  industrial: {
    fill: 'rgba(100, 116, 139, 0.6)',
    label: { en: 'Industrial', ja: '工業', 'es-419': 'Industrial', de: 'Industrie', th: 'อุตสาหกรรม', hi: 'औद्योगिक' },
  },
  exempt: {
    fill: 'rgba(59, 130, 246, 0.5)',
    label: { en: 'Exempt (public, institutions)', ja: '非課税（公共・団体）', 'es-419': 'Exento (público, instituciones)', de: 'Steuerfrei (öffentlich)', th: 'ยกเว้นภาษี (รัฐ สถาบัน)', hi: 'कर-मुक्त (सार्वजनिक)' },
  },
  vacant: {
    fill: 'rgba(34, 197, 94, 0.45)',
    label: { en: 'Vacant land', ja: '空き地', 'es-419': 'Terreno baldío', de: 'Brachland', th: 'ที่ดินว่าง', hi: 'खाली ज़मीन' },
  },
  unknown: {
    fill: 'rgba(148, 163, 184, 0.35)',
    label: { en: 'No assessment (roads, islands)', ja: '評価なし（道路・島）', 'es-419': 'Sin tasación (calles, islas)', de: 'Ohne Bewertung (Straßen)', th: 'ไม่มีการประเมิน (ถนน เกาะ)', hi: 'मूल्यांकन नहीं (सड़कें)' },
  },
};

export function LandUseLegend() {
  const { t } = useSampleI18n();
  return (
    <ul style={{ listStyle: 'none', margin: '4px 0 8px', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: 11 }}>
      {Object.entries(LAND_USE_STYLES).map(([key, style]) => (
        <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: style.fill, border: '1px solid rgba(71, 85, 105, 0.5)', flex: 'none' }} />
          {t(style.label)}
        </li>
      ))}
    </ul>
  );
}

/** Where loading has got to after the data itself is in. */
export type OverlayPhase = LoadProgress | { phase: 'build' } | { phase: 'draw' };

const MB = 1024 * 1024;

/**
 * Covers the map while a dataset loads. The spinner turns by a CSS transform,
 * which the compositor keeps animating while decoding or building the states
 * holds the main thread.
 */
export function LoadingOverlay({ progress }: { progress: OverlayPhase }) {
  const { t } = useSampleI18n();
  let text: string;
  let percent: number | null = null;
  switch (progress.phase) {
    case 'download': {
      const loaded = (progress.loaded / MB).toFixed(1);
      if (progress.total) {
        percent = Math.round((progress.loaded / progress.total) * 100);
        const total = (progress.total / MB).toFixed(1);
        text = t({ en: `Loading data… ${loaded} / ${total} MB`, ja: `データを読み込み中… ${loaded} / ${total} MB`, 'es-419': `Cargando datos… ${loaded} / ${total} MB`, de: `Daten werden geladen… ${loaded} / ${total} MB`, th: `กำลังโหลดข้อมูล… ${loaded} / ${total} MB`, hi: `डेटा लोड हो रहा है… ${loaded} / ${total} MB` });
      } else {
        text = t({ en: `Loading data… ${loaded} MB`, ja: `データを読み込み中… ${loaded} MB`, 'es-419': `Cargando datos… ${loaded} MB`, de: `Daten werden geladen… ${loaded} MB`, th: `กำลังโหลดข้อมูล… ${loaded} MB`, hi: `डेटा लोड हो रहा है… ${loaded} MB` });
      }
      break;
    }
    case 'decode':
      text = t({ en: 'Reading the polygons…', ja: 'ポリゴンを読み取り中…', 'es-419': 'Leyendo los polígonos…', de: 'Polygone werden gelesen…', th: 'กำลังอ่านโพลีกอน…', hi: 'पॉलीगॉन पढ़े जा रहे हैं…' });
      break;
    case 'build':
      text = t({ en: 'Preparing the polygons…', ja: 'ポリゴンを準備中…', 'es-419': 'Preparando los polígonos…', de: 'Polygone werden vorbereitet…', th: 'กำลังเตรียมโพลีกอน…', hi: 'पॉलीगॉन तैयार हो रहे हैं…' });
      break;
    case 'draw':
      text = t({ en: 'Drawing the map…', ja: '地図に描画中…', 'es-419': 'Dibujando el mapa…', de: 'Karte wird gezeichnet…', th: 'กำลังวาดแผนที่…', hi: 'मैप बनाया जा रहा है…' });
      break;
  }
  return (
    <div
      data-testid="loading-overlay"
      role="status"
      aria-live="polite"
      style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.35)' }}
    >
      <div style={{ background: 'white', borderRadius: 10, padding: '16px 20px', minWidth: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <div className="mc-loading-spinner" />
        <div style={{ fontSize: 14, color: '#0f172a' }}>{text}</div>
        {percent != null && (
          <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${percent}%`, height: '100%', background: '#2563eb' }} />
          </div>
        )}
        <style>{`
          .mc-loading-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid #cbd5e1; border-top-color: #2563eb; animation: mc-spin 0.8s linear infinite; }
          @keyframes mc-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
