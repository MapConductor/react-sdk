import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { SamplePageLayout } from '../components/SamplePageLayout';
import { getLanguageFromPath } from '../samples/i18n';
import { DEFAULT_SAMPLE_PAGE, isKnownSamplePage, isSupportedLanguage, resolveProviderForPage, type SupportedLanguage } from '../samples/sampleRegistry';

export type MapProvider = 'maplibre' | 'mapbox' | 'leaflet' | 'openlayers' | 'google' | 'google-3d' | 'arcgis' | 'arcgis-3d' | 'mapkit' | 'azuremaps' | 'cesium' | 'here' | 'tomtom' | 'maptiler' | 'longdo';

const providerByPath = new Map<string, MapProvider>([
  ['maplibre', 'maplibre'], ['maplibre-3d', 'maplibre'], ['mapbox', 'mapbox'],
  ['leaflet', 'leaflet'], ['openlayers', 'openlayers'], ['google-maps', 'google'],
  ['google', 'google'], ['google-maps-3d', 'google-3d'], ['google-3d', 'google-3d'],
  ['arcgis', 'arcgis'], ['arcgis-3d', 'arcgis-3d'], ['mapkit', 'mapkit'], ['azuremaps', 'azuremaps'], ['cesium', 'cesium'], ['here', 'here'], ['tomtom', 'tomtom'], ['maptiler', 'maptiler'], ['longdo', 'longdo'],
]);

export function parseSamplePath(pathname: string) {
  const [providerPath = 'maplibre', page = DEFAULT_SAMPLE_PAGE] = pathname.split('/').filter(Boolean);
  if (providerPath === 'camera-sync') {
    return { providerPath, page: 'camera-sync', provider: null };
  }
  if (providerPath === 'hello-map') {
    return { providerPath, page: 'hello-map', provider: null };
  }
  return { providerPath, page, provider: providerByPath.get(providerPath) ?? null };
}

export function providerPath(provider: MapProvider, page: string): string {
  const paths: Record<MapProvider, string> = {
    maplibre: resolveProviderForPage('maplibre', page),
    mapbox: 'mapbox', leaflet: 'leaflet', openlayers: 'openlayers',
    google: 'google-maps', 'google-3d': 'google-maps-3d',
    arcgis: 'arcgis', 'arcgis-3d': 'arcgis-3d', mapkit: 'mapkit', azuremaps: 'azuremaps', cesium: 'cesium', here: 'here', tomtom: 'tomtom', maptiler: 'maptiler', longdo: 'longdo',
  };
  return paths[provider];
}

function ProviderPageRoute() {
  const { provider, page, language: languageParam } = useParams();
  const language = getLanguageFromPath(useLocation().pathname);
  const requestedPage = isKnownSamplePage(page) ? page! : DEFAULT_SAMPLE_PAGE;
  if (requestedPage !== page || !isSupportedLanguage(languageParam)) {
    return <Navigate to={`/${provider ?? 'maplibre'}/${requestedPage}/${language}`} replace />;
  }
  if (requestedPage === 'camera-sync' || requestedPage === 'hello-map') {
    return <Navigate to={samplePath(provider ?? 'maplibre', requestedPage, language)} replace />;
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
      <Route path="/camera-sync" element={<Navigate to="en" replace />} />
      <Route path="/camera-sync/:language" element={<StandaloneCameraSyncRoute />} />
      <Route path="/hello-map" element={<Navigate to="en" replace />} />
      <Route path="/hello-map/:language" element={<StandaloneHelloMapRoute />} />
      <Route path="/:provider" element={<Navigate to={`${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
      <Route path="/:provider/:page" element={<Navigate to="en" replace />} />
      <Route path="/:provider/:page/:language" element={<ProviderPageRoute />} />
    </Routes>
  );
}

export function samplePath(provider: string, page: string, language: SupportedLanguage): string {
  if (page === 'camera-sync') return `/camera-sync/${language}`;
  if (page === 'hello-map') return `/hello-map/${language}`;
  return `/${provider}/${page}/${language}`;
}

function StandaloneCameraSyncRoute() {
  const { language } = useParams();
  if (!isSupportedLanguage(language)) {
    return <Navigate to="/camera-sync/en" replace />;
  }
  return <SamplePageLayout page="camera-sync" provider="camera-sync" language={language} />;
}

// Crawlable/SSR fallback for the tutorial: the interactive version (with the
// live map) is rendered by ClientMapRoutes; here we only emit the shell + SEO.
function StandaloneHelloMapRoute() {
  const { language } = useParams();
  if (!isSupportedLanguage(language)) {
    return <Navigate to="/hello-map/en" replace />;
  }
  return <SamplePageLayout page="hello-map" provider="hello-map" language={language} />;
}
