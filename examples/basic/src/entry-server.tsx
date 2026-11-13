import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { MAP_PROVIDERS, providerPath } from './app/appRouting';
import {
  DEFAULT_SAMPLE_PAGE,
  getSamplePageMetadata,
  SAMPLE_PAGES,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './samples/sampleRegistry';
import { getLanguageFromPath } from './samples/i18n';

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
  const languages: readonly SupportedLanguage[] = SUPPORTED_LANGUAGES;
  // Every provider's pages are prerendered: a path without its own file falls
  // back to /index.html (the MapLibre page), and the client then fails to
  // hydrate it (React #418).
  const providerPages = SAMPLE_PAGES
    .filter(page => page.id !== 'camera-sync')
    .flatMap(page => {
      const paths = new Set(MAP_PROVIDERS.map(provider => providerPath(provider, page.id)));
      return [...paths].flatMap(path => languages.map(language => `/${path}/${page.id}/${language}`));
    });
  return [
    ...providerPages,
    ...languages.map(language => `/camera-sync/${language}`),
  ];
}
