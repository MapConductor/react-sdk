import { translate, type Phrase, type SupportedLanguage } from './language';

export { SUPPORTED_LANGUAGES, isSupportedLanguage, translate } from './language';
export type { Phrase, SupportedLanguage } from './language';

export type SampleStatus = 'ready' | 'unsupported';

export interface SamplePageDefinition {
  id: string;
  /** Page name in every language it has been written in. */
  label: Phrase;
  group: string;
  status?: SampleStatus;
  showProviderSelector?: boolean;
  unavailableProviders?: string[];
}

export const SAMPLE_PAGES: SamplePageDefinition[] = [
  { id: 'hello-map', label: { en: 'Hello Map', ja: 'Hello Map', 'es-419': 'Hello Map', de: 'Hello Map', th: 'Hello Map', hi: 'Hello Map' }, group: 'Getting Started', showProviderSelector: false },
  { id: 'map', label: { en: 'Store Map', ja: '店舗マップ', 'es-419': 'Mapa de tiendas', de: 'Filialkarte', th: 'แผนที่ร้านค้า', hi: 'स्टोर मैप' }, group: 'Map' },
  { id: 'map-design', label: { en: 'Map Design', ja: '地図デザイン', 'es-419': 'Diseño del mapa', de: 'Kartendesign', th: 'ดีไซน์แผนที่', hi: 'मैप डिज़ाइन' }, group: 'Map' },
  { id: 'fly-to', label: { en: 'Fly To', ja: 'カメラ移動', 'es-419': 'Volar a un lugar', de: 'Kamerafahrt', th: 'การเคลื่อนกล้อง', hi: 'किसी बिंदु तक उड़ान' }, group: 'Map' },
  { id: 'fit-bounds', label: { en: 'Fit Bounds', ja: '範囲にフィット', 'es-419': 'Ajustar a límites', de: 'An Bereich anpassen', th: 'ปรับให้พอดีขอบเขต', hi: 'सीमा में फ़िट करें' }, group: 'Map' },
  { id: 'camera-restriction', label: { en: 'Camera Restriction', ja: 'カメラ制限', 'es-419': 'Restricción de cámara', de: 'Kamerabeschränkung', th: 'การจำกัดกล้อง', hi: 'कैमरा प्रतिबंध' }, group: 'Map' },
  { id: 'tilt', label: { en: 'Tilt', ja: '傾き', 'es-419': 'Inclinación', de: 'Neigung', th: 'การเอียง', hi: 'झुकाव' }, group: 'Map', unavailableProviders: ['google-maps', 'mapkit'] },
  { id: 'ui-settings', label: { en: 'UI Settings', ja: 'UI設定', 'es-419': 'Ajustes de interfaz', de: 'UI-Einstellungen', th: 'การตั้งค่า UI', hi: 'UI सेटिंग' }, group: 'Map' },
  { id: 'visible-region', label: { en: 'Visible Region', ja: '表示領域', 'es-419': 'Región visible', de: 'Sichtbarer Bereich', th: 'พื้นที่ที่มองเห็น', hi: 'दृश्य क्षेत्र' }, group: 'Map' },
  { id: 'camera-sync', label: { en: 'Camera Sync', ja: 'カメラ同期', 'es-419': 'Sincronización de cámara', de: 'Kamerasynchronisation', th: 'การซิงก์กล้อง', hi: 'कैमरा सिंक' }, group: 'Map', showProviderSelector: false },
  { id: 'marker', label: { en: 'Marker Icons', ja: 'マーカーアイコン', 'es-419': 'Iconos de marcadores', de: 'Marker-Icons', th: 'ไอคอนมาร์กเกอร์', hi: 'मार्कर आइकन' }, group: 'Marker' },
  { id: 'marker-animation', label: { en: 'Marker Animation', ja: 'マーカーアニメーション', 'es-419': 'Animación de marcadores', de: 'Marker-Animation', th: 'แอนิเมชันมาร์กเกอร์', hi: 'मार्कर एनिमेशन' }, group: 'Marker' },
  { id: 'post-office', label: { en: 'Post Office', ja: '郵便局', 'es-419': 'Oficinas postales', de: 'Postfilialen', th: 'ที่ทำการไปรษณีย์', hi: 'डाकघर' }, group: 'Marker', unavailableProviders: ['google-maps-3d'] },
  { id: 'post-office-cluster', label: { en: 'Post Office Cluster', ja: '郵便局クラスタリング', 'es-419': 'Agrupación de oficinas postales', de: 'Postfilialen-Clustering', th: 'การจัดกลุ่มที่ทำการไปรษณีย์', hi: 'डाकघरों की क्लस्टरिंग' }, group: 'Marker' },
  { id: 'circle', label: { en: 'Circle', ja: '円', 'es-419': 'Círculo', de: 'Kreis', th: 'วงกลม', hi: 'वृत्त' }, group: 'Shape' },
  { id: 'polyline', label: { en: 'Polyline', ja: 'ポリライン', 'es-419': 'Polilínea', de: 'Polylinie', th: 'โพลีไลน์', hi: 'पॉलीलाइन' }, group: 'Shape' },
  { id: 'polyline-click', label: { en: 'Polyline Click', ja: 'ポリラインのクリック', 'es-419': 'Clic en polilínea', de: 'Polylinien-Klick', th: 'การคลิกโพลีไลน์', hi: 'पॉलीलाइन क्लिक' }, group: 'Shape' },
  { id: 'polygon', label: { en: 'Polygon', ja: 'ポリゴン', 'es-419': 'Polígono', de: 'Polygon', th: 'โพลีกอน', hi: 'पॉलीगॉन' }, group: 'Shape' },
  { id: 'polygon-click', label: { en: 'Polygon Click', ja: 'ポリゴンのクリック', 'es-419': 'Clic en polígono', de: 'Polygon-Klick', th: 'การคลิกโพลีกอน', hi: 'पॉलीगॉन क्लिक' }, group: 'Shape' },
  { id: 'polygon-geodesic', label: { en: 'Polygon Geodesic', ja: '測地線ポリゴン', 'es-419': 'Polígono geodésico', de: 'Geodätisches Polygon', th: 'โพลีกอนแบบเส้นจีโอเดสิก', hi: 'जियोडेसिक पॉलीगॉन' }, group: 'Shape' },
  { id: 'polygon-hole', label: { en: 'Polygon Hole', ja: '穴付きポリゴン', 'es-419': 'Polígono con huecos', de: 'Polygon mit Loch', th: 'โพลีกอนแบบมีรู', hi: 'छेद वाला पॉलीगॉन' }, group: 'Shape', unavailableProviders: ['google-maps-3d'] },
  { id: 'ground-image', label: { en: 'Ground Image', ja: '地表画像', 'es-419': 'Imagen sobre el terreno', de: 'Bodenbild', th: 'ภาพบนพื้นผิว', hi: 'ग्राउंड इमेज' }, group: 'Overlay', unavailableProviders: ['google-maps-3d'] },
  { id: 'raster-layer', label: { en: 'Raster Layer', ja: 'ラスターレイヤー', 'es-419': 'Capa ráster', de: 'Rasterebene', th: 'เลเยอร์ราสเตอร์', hi: 'रास्टर लेयर' }, group: 'Overlay', unavailableProviders: ['google-maps-3d'] },
  { id: 'info-bubble-simple', label: { en: 'Simple Bubble', ja: 'シンプル吹き出し', 'es-419': 'Globo simple', de: 'Einfache Sprechblase', th: 'บับเบิลอย่างง่าย', hi: 'साधारण बबल' }, group: 'Info Bubble' },
  { id: 'info-bubble-styled', label: { en: 'Styled Bubble', ja: 'スタイル付き吹き出し', 'es-419': 'Globo con estilo', de: 'Gestaltete Sprechblase', th: 'บับเบิลแบบมีสไตล์', hi: 'स्टाइल वाला बबल' }, group: 'Info Bubble' },
  { id: 'info-bubble-multiple', label: { en: 'Multiple Bubbles', ja: '複数の吹き出し', 'es-419': 'Varios globos', de: 'Mehrere Sprechblasen', th: 'บับเบิลหลายอัน', hi: 'कई बबल' }, group: 'Info Bubble' },
  { id: 'info-bubble-rich', label: { en: 'Rich Bubble', ja: 'リッチ吹き出し', 'es-419': 'Globo enriquecido', de: 'Reichhaltige Sprechblase', th: 'บับเบิลแบบริช', hi: 'रिच बबल' }, group: 'Info Bubble' },
  { id: 'geojson-basic', label: { en: 'GeoJSON Basic', ja: 'GeoJSON 基本', 'es-419': 'GeoJSON básico', de: 'GeoJSON-Grundlagen', th: 'GeoJSON เบื้องต้น', hi: 'GeoJSON बुनियादी' }, group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'geojson-layer', label: { en: 'GeoJSON Layer', ja: 'GeoJSON レイヤー', 'es-419': 'Capa GeoJSON', de: 'GeoJSON-Ebene', th: 'เลเยอร์ GeoJSON', hi: 'GeoJSON लेयर' }, group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'kml-layer', label: { en: 'KML Layer', ja: 'KML レイヤー', 'es-419': 'Capa KML', de: 'KML-Ebene', th: 'เลเยอร์ KML', hi: 'KML लेयर' }, group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'heatmap-layer', label: { en: 'Heatmap Layer', ja: 'ヒートマップレイヤー', 'es-419': 'Capa de mapa de calor', de: 'Heatmap-Ebene', th: 'เลเยอร์ฮีตแมป', hi: 'हีटमैप लेयर' }, group: 'Extensions', unavailableProviders: ['google-maps-3d', 'cesium'] },
  { id: 'threejs-object', label: { en: 'Three.js Object (web only)', ja: 'Three.js (web only)', 'es-419': 'Objeto Three.js (solo web)', de: 'Three.js-Objekt (nur Web)', th: 'อ็อบเจกต์ Three.js (เว็บเท่านั้น)', hi: 'Three.js ऑब्जेक्ट (केवल वेब)' }, group: 'Extensions', unavailableProviders: ['cesium'] },
];

export const DEFAULT_SAMPLE_PAGE = 'hello-map';

export function getSamplePageLabel(
  definition: SamplePageDefinition,
  language: SupportedLanguage,
): string {
  return translate(language, definition.label);
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
    case 'mapkit': return 'MapKit';
    case 'azuremaps': return 'Azure Maps';
    case 'cesium': return 'Cesium';
    case 'here': return 'HERE';
    case 'tomtom': return 'TomTom';
    case 'maptiler': return 'MapTiler';
    case 'longdo': return 'Longdo';
    case 'mappls': return 'Mappls';
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
    description: translate(language, {
      en: `MapConductor React SDK ${label} sample using ${providerLabel}.`,
      ja: `MapConductor React SDKで${providerLabel}を使用する${label}のサンプルです。`,
      'es-419': `Ejemplo de ${label} de MapConductor React SDK con ${providerLabel}.`,
      de: `${label}-Beispiel des MapConductor React SDK mit ${providerLabel}.`,
      th: `ตัวอย่าง ${label} ของ MapConductor React SDK ที่ใช้ ${providerLabel}`,
      hi: `${providerLabel} पर MapConductor React SDK का ${label} सैंपल।`,
    }),
  };
}

export function isKnownSamplePage(page: string | undefined): boolean {
  return SAMPLE_PAGES.some((item) => item.id === page);
}

export function getSamplePageDefinition(page: string | undefined): SamplePageDefinition | undefined {
  return SAMPLE_PAGES.find((item) => item.id === page);
}
