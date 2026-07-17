export type SampleStatus = 'ready' | 'unsupported';

export interface SamplePageDefinition {
  id: string;
  label: string;
  labelJa?: string;
  group: string;
  status?: SampleStatus;
  showProviderSelector?: boolean;
  unavailableProviders?: string[];
}

export const SAMPLE_PAGES: SamplePageDefinition[] = [
  { id: 'map', label: 'Store Map', labelJa: '店舗マップ', group: 'Map' },
  { id: 'map-design', label: 'Map Design', labelJa: '地図デザイン', group: 'Map' },
  { id: 'fly-to', label: 'Fly To', labelJa: 'カメラ移動', group: 'Map' },
  { id: 'tilt', label: 'Tilt', labelJa: '傾き', group: 'Map', unavailableProviders: ['leaflet'] },
  { id: 'visible-region', label: 'Visible Region', labelJa: '表示領域', group: 'Map' },
  { id: 'camera-sync', label: 'Camera Sync', labelJa: 'カメラ同期', group: 'Map', showProviderSelector: false },
  { id: 'marker', label: 'Marker Icons', labelJa: 'マーカーアイコン', group: 'Marker' },
  { id: 'marker-animation', label: 'Marker Animation', labelJa: 'マーカーアニメーション', group: 'Marker' },
  { id: 'post-office', label: 'Post Office', labelJa: '郵便局', group: 'Marker', unavailableProviders: ['google-maps-3d'] },
  { id: 'post-office-cluster', label: 'Post Office Cluster', labelJa: '郵便局クラスタリング', group: 'Marker' },
  { id: 'circle', label: 'Circle', labelJa: '円', group: 'Shape' },
  { id: 'polyline', label: 'Polyline', labelJa: 'ポリライン', group: 'Shape' },
  { id: 'polyline-click', label: 'Polyline Click', labelJa: 'ポリラインのクリック', group: 'Shape' },
  { id: 'polygon', label: 'Polygon', labelJa: 'ポリゴン', group: 'Shape' },
  { id: 'polygon-click', label: 'Polygon Click', labelJa: 'ポリゴンのクリック', group: 'Shape' },
  { id: 'polygon-geodesic', label: 'Polygon Geodesic', labelJa: '測地線ポリゴン', group: 'Shape' },
  { id: 'polygon-hole', label: 'Polygon Hole', labelJa: '穴付きポリゴン', group: 'Shape', unavailableProviders: ['google-maps-3d'] },
  { id: 'ground-image', label: 'Ground Image', labelJa: '地表画像', group: 'Overlay', unavailableProviders: ['google-maps-3d'] },
  { id: 'raster-layer', label: 'Raster Layer', labelJa: 'ラスターレイヤー', group: 'Overlay', unavailableProviders: ['google-maps-3d'] },
  { id: 'info-bubble-simple', label: 'Simple Bubble', labelJa: 'シンプル吹き出し', group: 'Info Bubble' },
  { id: 'info-bubble-styled', label: 'Styled Bubble', labelJa: 'スタイル付き吹き出し', group: 'Info Bubble' },
  { id: 'info-bubble-multiple', label: 'Multiple Bubbles', labelJa: '複数の吹き出し', group: 'Info Bubble' },
  { id: 'info-bubble-rich', label: 'Rich Bubble', labelJa: 'リッチ吹き出し', group: 'Info Bubble' },
  { id: 'geojson-basic', label: 'GeoJSON Basic', labelJa: 'GeoJSON 基本', group: 'Extensions', unavailableProviders: ['google-maps-3d'] },
  { id: 'geojson-layer', label: 'GeoJSON Layer', labelJa: 'GeoJSON レイヤー', group: 'Extensions', unavailableProviders: ['google-maps-3d'] },
  { id: 'heatmap-layer', label: 'Heatmap Layer', labelJa: 'ヒートマップレイヤー', group: 'Extensions', unavailableProviders: ['google-maps-3d'] },
  { id: 'threejs-object', label: 'Three.js Object', labelJa: 'Three.js オブジェクト', group: 'Extensions' },
];

export const DEFAULT_SAMPLE_PAGE = 'map';
export type SupportedLanguage = 'en' | 'ja';

const MAPLIBRE_3D_PAGES = new Set(['polygon-geodesic', 'polyline-click']);

export function isMapLibre3DPage(page: string | undefined): boolean {
  return page !== undefined && MAPLIBRE_3D_PAGES.has(page);
}

export function resolveProviderForPage(provider: string, page: string): string {
  if (provider !== 'maplibre' && provider !== 'maplibre-3d') return provider;
  return isMapLibre3DPage(page) ? 'maplibre-3d' : 'maplibre';
}

export function getProviderLabel(provider: string | undefined): string {
  switch (provider) {
    case 'maplibre-3d': return 'MapLibre 3D';
    case 'google-maps': return 'Google Maps';
    case 'google-maps-3d': return 'Google Maps 3D';
    case 'leaflet': return 'Leaflet';
    default: return 'MapLibre';
  }
}

export function getSamplePageMetadata(
  page: string | undefined,
  provider: string | undefined,
  language: SupportedLanguage = 'en',
): { title: string; description: string } {
  const definition = getSamplePageDefinition(page) ?? getSamplePageDefinition(DEFAULT_SAMPLE_PAGE)!;
  const providerLabel = getProviderLabel(provider);
  const label = language === 'ja' ? definition.labelJa ?? definition.label : definition.label;
  return {
    title: `${label} | ${providerLabel} | MapConductor React SDK`,
    description: language === 'ja'
      ? `MapConductor React SDKで${providerLabel}を使用する${label}のサンプルです。`
      : `MapConductor React SDK ${label} sample using ${providerLabel}.`,
  };
}

export function isKnownSamplePage(page: string | undefined): boolean {
  return SAMPLE_PAGES.some((item) => item.id === page);
}

export function getSamplePageDefinition(page: string | undefined): SamplePageDefinition | undefined {
  return SAMPLE_PAGES.find((item) => item.id === page);
}
