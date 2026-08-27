import type { MapProvider } from './types';

/**
 * プロバイダの表示名。ヘッダーの切り替えボタンの文字・一覧の文字・
 * Camera Sync のペインごとのドロップダウン・アクセシビリティラベル
 * （実機の UI テストがこれで叩く）の**唯一の出所**。
 * 複数箇所に散らすと、片方だけ直してテストが見つけられなくなる。
 */
export const PROVIDER_LABELS: Record<MapProvider, string> = {
  'google-maps': 'GoogleMapView',
  maplibre: 'MapLibreMapView',
  arcgis: 'ArcGISMapView2D',
  'arcgis-3d': 'ArcGISMapView',
  longdo: 'LongdoMapView',
  maptiler: 'MapTilerMapView',
  mapbox: 'MapboxMapView',
  tomtom: 'TomTomMapView',
};

/**
 * ドロップダウンに並べる順。ヘッダーと Camera Sync で同じ順に出す。
 * `MapProvider` に足したらここにも足すこと（`Record` ではないので
 * 型では検出できない）。
 */
export const MAP_PROVIDERS: readonly MapProvider[] = [
  'google-maps',
  'maplibre',
  'arcgis',
  'arcgis-3d',
  'longdo',
  'maptiler',
  'mapbox',
  'tomtom',
];
