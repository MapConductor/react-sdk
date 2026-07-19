import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import {
  DEFAULT_SAMPLE_PAGE,
  getSamplePageMetadata,
  resolveProviderForPage,
  SAMPLE_PAGES,
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
  language: 'en' | 'ja';
} {
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const [, provider, page = DEFAULT_SAMPLE_PAGE] = pathname.split('/');
  const language = getLanguageFromPath(pathname);
  return { ...getSamplePageMetadata(page, provider, language), language };
}

export function getStaticPaths(): string[] {
  const providers = ['mapbox', 'leaflet', 'openlayers', 'arcgis', 'arcgis-3d', 'cesium', 'google-maps', 'google-maps-3d'];
  const languages = ['en', 'ja'];
  return SAMPLE_PAGES.flatMap(page => {
    const mapLibreProvider = resolveProviderForPage('maplibre', page.id);
    return [mapLibreProvider, ...providers].flatMap(provider =>
      languages.map(language => `/${provider}/${page.id}/${language}`),
    );
  });
}
