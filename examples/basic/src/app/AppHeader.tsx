import { useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '../sampleRegistry';
import { translate } from '../i18n';
import type { MapProvider } from './appRouting';

const PROVIDERS: Array<{ value: MapProvider; label: string }> = [
  { value: 'maplibre', label: 'MapLibre' },
  { value: 'mapbox', label: 'Mapbox' },
  { value: 'leaflet', label: 'Leaflet' },
  { value: 'openlayers', label: 'OpenLayers' },
  { value: 'arcgis', label: 'ArcGIS 2D' },
  { value: 'arcgis-3d', label: 'ArcGIS 3D' },
  { value: 'cesium', label: 'Cesium' },
  { value: 'here', label: 'HERE' },
  { value: 'google', label: 'Google Maps' },
  { value: 'google-3d', label: 'Google Maps 3D' },
];

const LANGUAGES: Array<{ value: SupportedLanguage; label: string; short: string }> = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'ja', label: '日本語', short: 'JA' },
  { value: 'es-419', label: 'Español (Latinoamérica)', short: 'ES' },
];

type IconMenu = 'provider' | 'language' | null;

export function AppHeader({ language, provider, showProviderSelector, onOpenMenu, onProviderChange, onLanguageChange }: {
  language: SupportedLanguage;
  provider: MapProvider | null;
  showProviderSelector: boolean;
  onOpenMenu(): void;
  onProviderChange(provider: MapProvider): void;
  onLanguageChange(language: SupportedLanguage): void;
}) {
  const [openMenu, setOpenMenu] = useState<IconMenu>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handlePointer = (event: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenu]);

  const activeLanguageShort = LANGUAGES.find(l => l.value === language)?.short ?? 'EN';
  const activeProviderLabel = PROVIDERS.find(p => p.value === provider)?.label ?? 'Provider';

  return (
    <header className="header">
      <h1>MapConductor React SDK Samples</h1>
      <div className="header-controls" ref={controlsRef}>
        <button type="button" className="menu-button" aria-label="Open samples menu" onClick={onOpenMenu}>
          <span /><span /><span />
        </button>
        {showProviderSelector && <label className="provider-control"><span>Provider</span>
          <select value={provider ?? 'maplibre'} onChange={event => onProviderChange(event.target.value as MapProvider)}>
            {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </label>}
        {showProviderSelector && (
          <div className="header-icon-control">
            <button
              type="button"
              className="header-icon-button"
              aria-label={`Provider: ${activeProviderLabel}`}
              aria-expanded={openMenu === 'provider'}
              onClick={() => setOpenMenu(openMenu === 'provider' ? null : 'provider')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </button>
            {openMenu === 'provider' && (
              <div className="header-icon-menu" role="menu">
                {PROVIDERS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={provider === p.value}
                    className={`header-icon-menu-item${provider === p.value ? ' active' : ''}`}
                    onClick={() => { onProviderChange(p.value); setOpenMenu(null); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <label className="language-control"><span>{translate(language, 'Language', '言語', 'Idioma')}</span>
          <select value={language} onChange={event => onLanguageChange(event.target.value as SupportedLanguage)}>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </label>
        <div className="header-icon-control">
          <button
            type="button"
            className="header-icon-button header-language-icon-button"
            aria-label={`Language: ${activeLanguageShort}`}
            aria-expanded={openMenu === 'language'}
            onClick={() => setOpenMenu(openMenu === 'language' ? null : 'language')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="header-language-short">{activeLanguageShort}</span>
          </button>
          {openMenu === 'language' && (
            <div className="header-icon-menu" role="menu">
              {LANGUAGES.map(l => (
                <button
                  key={l.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={language === l.value}
                  className={`header-icon-menu-item${language === l.value ? ' active' : ''}`}
                  onClick={() => { onLanguageChange(l.value); setOpenMenu(null); }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
