import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import {
  DEFAULT_SAMPLE_PAGE,
  getSamplePageMetadata,
  resolveProviderForPage,
  SAMPLE_PAGES,
  type SupportedLanguage,
} from './sampleRegistry';
import { getLanguageFromPath } from './i18n';

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}

export function getDocumentMetadata(url: string): {
  title: string;
  description: string;
  language: SupportedLanguage;
} {
  const pathname = new URL(url, 'http://localhost').pathname;
  const [providerPath = 'maplibre', pagePath = DEFAULT_SAMPLE_PAGE] = pathname
    .split('/')
    .filter(Boolean);
  const isCameraSync = providerPath === 'camera-sync';
  const provider = isCameraSync ? 'camera-sync' : providerPath;
  const page = isCameraSync ? 'camera-sync' : pagePath;
  const language = getLanguageFromPath(pathname);
  return { ...getSamplePageMetadata(page, provider, language), language };
}

export function getStaticPaths(): string[] {
  const providers = [
    'mapbox',
    'leaflet',
    'openlayers',
    'arcgis',
    'arcgis-3d',
    'cesium',
    'here',
    'google-maps',
    'google-maps-3d',
  ];
  const languages: SupportedLanguage[] = ['en', 'ja', 'es-419'];
  const providerPages = SAMPLE_PAGES
    .filter(page => page.id !== 'camera-sync')
    .flatMap(page => {
      const mapLibreProvider = resolveProviderForPage('maplibre', page.id);
      return [mapLibreProvider, ...providers].flatMap(provider =>
        languages.map(language => `/${provider}/${page.id}/${language}`),
      );
    });
  return [
    ...providerPages,
    ...languages.map(language => `/camera-sync/${language}`),
  ];
}
