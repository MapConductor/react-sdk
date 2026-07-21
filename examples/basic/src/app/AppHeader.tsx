import type { SupportedLanguage } from '../sampleRegistry';
import { translate } from '../i18n';
import type { MapProvider } from './appRouting';

export function AppHeader({ language, provider, showProviderSelector, onOpenMenu, onProviderChange, onLanguageChange }: {
  language: SupportedLanguage;
  provider: MapProvider | null;
  showProviderSelector: boolean;
  onOpenMenu(): void;
  onProviderChange(provider: MapProvider): void;
  onLanguageChange(language: SupportedLanguage): void;
}) {
  return (
    <header className="header">
      <h1>MapConductor React SDK Samples</h1>
      <div className="header-controls">
        <button type="button" className="menu-button" aria-label="Open samples menu" onClick={onOpenMenu}>
          <span /><span /><span />
        </button>
        {showProviderSelector && <label className="provider-control"><span>Provider</span>
          <select value={provider ?? 'maplibre'} onChange={event => onProviderChange(event.target.value as MapProvider)}>
            <option value="maplibre">MapLibre</option><option value="mapbox">Mapbox</option>
            <option value="leaflet">Leaflet</option><option value="openlayers">OpenLayers</option>
            <option value="arcgis">ArcGIS 2D</option><option value="arcgis-3d">ArcGIS 3D</option>
            <option value="cesium">Cesium</option><option value="here">HERE</option>
            <option value="google">Google Maps</option>
            <option value="google-3d">Google Maps 3D</option>
          </select>
        </label>}
        <label className="language-control"><span>{translate(language, 'Language', '言語', 'Idioma')}</span>
          <select value={language} onChange={event => onLanguageChange(event.target.value as SupportedLanguage)}>
            <option value="en">English</option><option value="ja">日本語</option>
            <option value="es-419">Español (Latinoamérica)</option>
          </select>
        </label>
      </div>
    </header>
  );
}
