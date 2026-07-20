import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { SamplePageLayout } from '../components/SamplePageLayout';
import { getLanguageFromPath } from '../i18n';
import { DEFAULT_SAMPLE_PAGE, isKnownSamplePage, resolveProviderForPage, type SupportedLanguage } from '../sampleRegistry';

export type MapProvider = 'maplibre' | 'mapbox' | 'leaflet' | 'openlayers' | 'google' | 'google-3d' | 'arcgis' | 'arcgis-3d' | 'cesium';

const providerByPath = new Map<string, MapProvider>([
  ['maplibre', 'maplibre'], ['maplibre-3d', 'maplibre'], ['mapbox', 'mapbox'],
  ['leaflet', 'leaflet'], ['openlayers', 'openlayers'], ['google-maps', 'google'],
  ['google', 'google'], ['google-maps-3d', 'google-3d'], ['google-3d', 'google-3d'],
  ['arcgis', 'arcgis'], ['arcgis-3d', 'arcgis-3d'], ['cesium', 'cesium'],
]);

export function parseSamplePath(pathname: string) {
  const [providerPath = 'maplibre', page = DEFAULT_SAMPLE_PAGE] = pathname.split('/').filter(Boolean);
  return { providerPath, page, provider: providerByPath.get(providerPath) ?? null };
}

export function providerPath(provider: MapProvider, page: string): string {
  const paths: Record<MapProvider, string> = {
    maplibre: resolveProviderForPage('maplibre', page),
    mapbox: 'mapbox', leaflet: 'leaflet', openlayers: 'openlayers',
    google: 'google-maps', 'google-3d': 'google-maps-3d',
    arcgis: 'arcgis', 'arcgis-3d': 'arcgis-3d', cesium: 'cesium',
  };
  return paths[provider];
}

function ProviderPageRoute() {
  const { provider, page, language: languageParam } = useParams();
  const language = getLanguageFromPath(useLocation().pathname);
  const requestedPage = isKnownSamplePage(page) ? page : DEFAULT_SAMPLE_PAGE;
  if (requestedPage !== page || (languageParam !== 'en' && languageParam !== 'ja')) {
    return <Navigate to={`/${provider ?? 'maplibre'}/${requestedPage}/${language}`} replace />;
  }
  if (!provider || !providerByPath.has(provider)) {
    return <Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/${language}`} replace />;
  }
  return <SamplePageLayout page={requestedPage} provider={provider} language={language} />;
}

export function CrawlableRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
      <Route path="/:provider" element={<Navigate to={`${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
      <Route path="/:provider/:page" element={<Navigate to="en" replace />} />
      <Route path="/:provider/:page/:language" element={<ProviderPageRoute />} />
    </Routes>
  );
}

export function samplePath(provider: string, page: string, language: SupportedLanguage): string {
  return `/${provider}/${page}/${language}`;
}
