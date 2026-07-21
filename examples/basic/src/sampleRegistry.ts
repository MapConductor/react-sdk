export type SampleStatus = 'ready' | 'unsupported';

export interface SamplePageDefinition {
  id: string;
  label: string;
  labelJa?: string;
  labelEs419?: string;
  group: string;
  status?: SampleStatus;
  showProviderSelector?: boolean;
  unavailableProviders?: string[];
}

export const SAMPLE_PAGES: SamplePageDefinition[] = [
  { id: 'map', label: 'Store Map', labelJa: '店舗マップ', labelEs419: 'Mapa de tiendas', group: 'Map' },
  { id: 'map-design', label: 'Map Design', labelJa: '地図デザイン', labelEs419: 'Diseño del mapa', group: 'Map' },
  { id: 'fly-to', label: 'Fly To', labelJa: 'カメラ移動', labelEs419: 'Volar a un lugar', group: 'Map' },
  { id: 'tilt', label: 'Tilt', labelJa: '傾き', labelEs419: 'Inclinación', group: 'Map', unavailableProviders: ['google-maps'] },
  { id: 'visible-region', label: 'Visible Region', labelJa: '表示領域', labelEs419: 'Región visible', group: 'Map' },
  { id: 'camera-sync', label: 'Camera Sync', labelJa: 'カメラ同期', labelEs419: 'Sincronización de cámara', group: 'Map', showProviderSelector: false },
  { id: 'marker', label: 'Marker Icons', labelJa: 'マーカーアイコン', labelEs419: 'Iconos de marcadores', group: 'Marker' },
  { id: 'marker-animation', label: 'Marker Animation', labelJa: 'マーカーアニメーション', labelEs419: 'Animación de marcadores', group: 'Marker' },
  { id: 'post-office', label: 'Post Office', labelJa: '郵便局', labelEs419: 'Oficinas postales', group: 'Marker', unavailableProviders: ['google-maps-3d'] },
  { id: 'post-office-cluster', label: 'Post Office Cluster', labelJa: '郵便局クラスタリング', labelEs419: 'Agrupación de oficinas postales', group: 'Marker' },
  { id: 'circle', label: 'Circle', labelJa: '円', labelEs419: 'Círculo', group: 'Shape' },
  { id: 'polyline', label: 'Polyline', labelJa: 'ポリライン', labelEs419: 'Polilínea', group: 'Shape' },
  { id: 'polyline-click', label: 'Polyline Click', labelJa: 'ポリラインのクリック', labelEs419: 'Clic en polilínea', group: 'Shape' },
  { id: 'polygon', label: 'Polygon', labelJa: 'ポリゴン', labelEs419: 'Polígono', group: 'Shape' },
  { id: 'polygon-click', label: 'Polygon Click', labelJa: 'ポリゴンのクリック', labelEs419: 'Clic en polígono', group: 'Shape' },
  { id: 'polygon-geodesic', label: 'Polygon Geodesic', labelJa: '測地線ポリゴン', labelEs419: 'Polígono geodésico', group: 'Shape' },
  { id: 'polygon-hole', label: 'Polygon Hole', labelJa: '穴付きポリゴン', labelEs419: 'Polígono con huecos', group: 'Shape', unavailableProviders: ['google-maps-3d'] },
  { id: 'ground-image', label: 'Ground Image', labelJa: '地表画像', labelEs419: 'Imagen sobre el terreno', group: 'Overlay', unavailableProviders: ['google-maps-3d'] },
  { id: 'raster-layer', label: 'Raster Layer', labelJa: 'ラスターレイヤー', labelEs419: 'Capa ráster', group: 'Overlay', unavailableProviders: ['google-maps-3d'] },
  { id: 'info-bubble-simple', label: 'Simple Bubble', labelJa: 'シンプル吹き出し', labelEs419: 'Globo simple', group: 'Info Bubble' },
  { id: 'info-bubble-styled', label: 'Styled Bubble', labelJa: 'スタイル付き吹き出し', labelEs419: 'Globo con estilo', group: 'Info Bubble' },
  { id: 'info-bubble-multiple', label: 'Multiple Bubbles', labelJa: '複数の吹き出し', labelEs419: 'Varios globos', group: 'Info Bubble' },
  { id: 'info-bubble-rich', label: 'Rich Bubble', labelJa: 'リッチ吹き出し', labelEs419: 'Globo enriquecido', group: 'Info Bubble' },
  { id: 'geojson-basic', label: 'GeoJSON Basic', labelJa: 'GeoJSON 基本', labelEs419: 'GeoJSON básico', group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'geojson-layer', label: 'GeoJSON Layer', labelJa: 'GeoJSON レイヤー', labelEs419: 'Capa GeoJSON', group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'heatmap-layer', label: 'Heatmap Layer', labelJa: 'ヒートマップレイヤー', labelEs419: 'Capa de mapa de calor', group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'threejs-object', label: 'Three.js Object (web only)', labelJa: 'Three.js (web only)', labelEs419: 'Objeto Three.js (solo web)', group: 'Extensions', unavailableProviders: ['cesium'] },
];

export const DEFAULT_SAMPLE_PAGE = 'map';
export type SupportedLanguage = 'en' | 'ja' | 'es-419';

export function isSupportedLanguage(language: string | undefined): language is SupportedLanguage {
  return language === 'en' || language === 'ja' || language === 'es-419';
}

export function getSamplePageLabel(
  definition: SamplePageDefinition,
  language: SupportedLanguage,
): string {
  if (language === 'ja') return definition.labelJa ?? definition.label;
  if (language === 'es-419') return definition.labelEs419 ?? definition.label;
  return definition.label;
}

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
    case 'camera-sync': return 'Multiple Providers';
    case 'maplibre-3d': return 'MapLibre 3D';
    case 'mapbox': return 'Mapbox';
    case 'google-maps': return 'Google Maps';
    case 'google-maps-3d': return 'Google Maps 3D';
    case 'leaflet': return 'Leaflet';
    case 'openlayers': return 'OpenLayers';
    case 'arcgis': return 'ArcGIS 2D';
    case 'arcgis-3d': return 'ArcGIS 3D';
    case 'cesium': return 'Cesium';
    case 'here': return 'HERE';
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
  const label = getSamplePageLabel(definition, language);
  return {
    title: `${label} | ${providerLabel} | MapConductor React SDK`,
    description: language === 'ja'
      ? `MapConductor React SDKで${providerLabel}を使用する${label}のサンプルです。`
      : language === 'es-419'
        ? `Ejemplo de ${label} de MapConductor React SDK con ${providerLabel}.`
        : `MapConductor React SDK ${label} sample using ${providerLabel}.`,
  };
}

export function isKnownSamplePage(page: string | undefined): boolean {
  return SAMPLE_PAGES.some((item) => item.id === page);
}

export function getSamplePageDefinition(page: string | undefined): SamplePageDefinition | undefined {
  return SAMPLE_PAGES.find((item) => item.id === page);
}
