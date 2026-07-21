import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { SingletonMapsProvider } from './SingletonMaps';
import { SamplePageLayout } from './components/SamplePageLayout';
import { getLanguageFromPath } from './i18n';
import { parseSamplePath, samplePath } from './app/appRouting';
import {
  DEFAULT_SAMPLE_PAGE,
  getSamplePageDefinition,
  isKnownSamplePage,
  isSupportedLanguage,
} from './sampleRegistry';

// Every sample page is loaded on demand instead of being bundled into one chunk.
// A handful of pages (camera-sync, post-office, post-office-cluster, heatmap-layer)
// statically import several provider SDKs at once to render multiple providers
// side by side; without this, those imports would pull every provider's runtime
// into whatever chunk this file lives in, defeating the per-provider code
// splitting done in MapViewContainer.tsx.
const CirclePage = lazy(() => import('./pages/CirclePage').then(m => ({ default: m.CirclePage })));
const MapPage = lazy(() => import('./pages/map/basic/StoreMapPage').then(m => ({ default: m.MapPage })));
const MarkerIconsPage = lazy(() => import('./pages/marker/icons/MarkerIconsPage').then(m => ({ default: m.MarkerIconsPage })));
const PolygonPage = lazy(() => import('./pages/PolygonPage').then(m => ({ default: m.PolygonPage })));
const PolylinePage = lazy(() => import('./pages/PolylinePage').then(m => ({ default: m.PolylinePage })));
const GroundImagePage = lazy(() => import('./pages/groundimage/GroundImagePage').then(m => ({ default: m.GroundImagePage })));
const MultipleBubblesPage = lazy(() => import('./pages/infobubble/MultipleBubblesPage').then(m => ({ default: m.MultipleBubblesPage })));
const RichContentBubblePage = lazy(() => import('./pages/infobubble/RichContentBubblePage').then(m => ({ default: m.RichContentBubblePage })));
const SimpleInfoBubblePage = lazy(() => import('./pages/infobubble/SimpleInfoBubblePage').then(m => ({ default: m.SimpleInfoBubblePage })));
const StyledInfoBubblePage = lazy(() => import('./pages/infobubble/StyledInfoBubblePage').then(m => ({ default: m.StyledInfoBubblePage })));
const MapDesignPage = lazy(() => import('./pages/map/design/MapDesignPage').then(m => ({ default: m.MapDesignPage })));
const FlyToPage = lazy(() => import('./pages/map/flyto/FlyToPage').then(m => ({ default: m.FlyToPage })));
const TiltPage = lazy(() => import('./pages/map/tilt/TiltPage').then(m => ({ default: m.TiltPage })));
const VisibleRegionPage = lazy(() => import('./pages/map/visibleregion/VisibleRegionPage').then(m => ({ default: m.VisibleRegionPage })));
const CameraSyncPage = lazy(() => import('./pages/map/camerasync/CameraSyncPage').then(m => ({ default: m.CameraSyncPage })));
const MarkerAnimationPage = lazy(() => import('./pages/marker/animation/MarkerAnimationPage').then(m => ({ default: m.MarkerAnimationPage })));
const PostOfficePage = lazy(() => import('./pages/marker/postoffice/PostOfficePage').then(m => ({ default: m.PostOfficePage })));
const PostOfficeClusterPage = lazy(() => import('./pages/marker/postofficecluster/PostOfficeClusterPage').then(m => ({ default: m.PostOfficeClusterPage })));
const PolygonClickPage = lazy(() => import('./pages/polygon/click/PolygonClickPage').then(m => ({ default: m.PolygonClickPage })));
const PolygonGeodesicPage = lazy(() => import('./pages/polygon/geodesic/PolygonGeodesicPage').then(m => ({ default: m.PolygonGeodesicPage })));
const PolygonHolePage = lazy(() => import('./pages/polygon/hole/PolygonHolePage').then(m => ({ default: m.PolygonHolePage })));
const PolylineClickPage = lazy(() => import('./pages/polyline/click/PolylineClickPage').then(m => ({ default: m.PolylineClickPage })));
const RasterLayerPage = lazy(() => import('./pages/rasterlayer/RasterLayerPage').then(m => ({ default: m.RasterLayerPage })));
const HeatmapLayerPage = lazy(() => import('./pages/heatmaplayer/HeatmapLayerPage').then(m => ({ default: m.HeatmapLayerPage })));
const BasicGeoJSONPage = lazy(() => import('./pages/geojson/basic/BasicGeoJSONPage').then(m => ({ default: m.BasicGeoJSONPage })));
const GeoJSONLayerPage = lazy(() => import('./pages/geojson/layer/GeoJSONLayerPage').then(m => ({ default: m.GeoJSONLayerPage })));
const ThreeJsObjectPage = lazy(() => import('./pages/threejs/ThreeJsObjectPage').then(m => ({ default: m.ThreeJsObjectPage })));

function SamplePageLoadingPlaceholder() {
  return (
    <div className="sample-map-placeholder" role="status">
      Loading…
    </div>
  );
}

function isPageUnavailableOnProvider(page: string | undefined, provider: string | undefined): boolean {
  const definition = getSamplePageDefinition(page);
  return definition?.unavailableProviders?.includes(provider ?? '') ?? false;
}

function ProviderUnavailableOverlay() {
  return (
    <div className="provider-unavailable-overlay" role="status" aria-live="polite">
      <div className="provider-unavailable-box">
        This feature is not available on this provider
      </div>
    </div>
  );
}

function pageContent(page: string | undefined) {
  switch (page) {
    case 'map-design': return <MapDesignPage />;
    case 'fly-to': return <FlyToPage />;
    case 'tilt': return <TiltPage />;
    case 'visible-region': return <VisibleRegionPage />;
    case 'camera-sync': return <CameraSyncPage />;
    case 'marker': return <MarkerIconsPage />;
    case 'marker-animation': return <MarkerAnimationPage />;
    case 'post-office': return <PostOfficePage />;
    case 'circle': return <CirclePage />;
    case 'polyline': return <PolylinePage />;
    case 'polyline-click': return <PolylineClickPage />;
    case 'polygon': return <PolygonPage />;
    case 'polygon-click': return <PolygonClickPage />;
    case 'polygon-geodesic': return <PolygonGeodesicPage />;
    case 'polygon-hole': return <PolygonHolePage />;
    case 'ground-image': return <GroundImagePage />;
    case 'raster-layer': return <RasterLayerPage />;
    case 'info-bubble-simple': return <SimpleInfoBubblePage />;
    case 'info-bubble-styled': return <StyledInfoBubblePage />;
    case 'info-bubble-multiple': return <MultipleBubblesPage />;
    case 'info-bubble-rich': return <RichContentBubblePage />;
    case 'post-office-cluster': return <PostOfficeClusterPage />;
    case 'heatmap-layer': return <HeatmapLayerPage />;
    case 'geojson-basic': return <BasicGeoJSONPage />;
    case 'geojson-layer': return <GeoJSONLayerPage />;
    case 'threejs-object': return <ThreeJsObjectPage />;
    default: return <MapPage />;
  }
}

function ProviderPageRoute() {
  const { provider, page, language } = useParams<{ provider: string; page: string; language: string }>();
  const requestedPage = isKnownSamplePage(page) ? page! : DEFAULT_SAMPLE_PAGE;

  if (requestedPage !== page || !isSupportedLanguage(language)) {
    return <Navigate to={`/${provider ?? 'maplibre'}/${requestedPage}/${isSupportedLanguage(language) ? language : 'en'}`} replace />;
  }
  if (requestedPage === 'camera-sync') {
    return <Navigate to={samplePath(provider ?? 'maplibre', requestedPage, language)} replace />;
  }
  if (provider !== 'maplibre' && provider !== 'maplibre-3d' && provider !== 'mapbox' && provider !== 'leaflet' && provider !== 'openlayers' && provider !== 'google-maps' && provider !== 'google-maps-3d' && provider !== 'arcgis' && provider !== 'arcgis-3d' && provider !== 'cesium' && provider !== 'here') {
    return <Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/${language}`} replace />;
  }

  const isUnavailable = isPageUnavailableOnProvider(requestedPage, provider);
  return (
    <Suspense fallback={<SamplePageLoadingPlaceholder />}>
      {isUnavailable ? <MapPage /> : pageContent(page)}
      {isUnavailable && <ProviderUnavailableOverlay />}
    </Suspense>
  );
}

function StandaloneCameraSyncRoute() {
  const { language } = useParams<{ language: string }>();
  if (!isSupportedLanguage(language)) {
    return <Navigate to="/camera-sync/en" replace />;
  }
  return (
    <Suspense fallback={<SamplePageLoadingPlaceholder />}>
      <CameraSyncPage />
    </Suspense>
  );
}

export default function ClientMapRoutes() {
  const location = useLocation();
  const { providerPath: provider, page: routePage } = parseSamplePath(location.pathname);
  const page = isKnownSamplePage(routePage) ? routePage : DEFAULT_SAMPLE_PAGE;
  const language = getLanguageFromPath(location.pathname);

  return (
    <SamplePageLayout page={page} provider={provider} language={language}>
      <SingletonMapsProvider>
        <Routes>
          <Route path="/" element={<Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
          <Route path="/camera-sync" element={<Navigate to="en" replace />} />
          <Route path="/camera-sync/:language" element={<StandaloneCameraSyncRoute />} />
          <Route path="/:provider" element={<Navigate to={`${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
          <Route path="/:provider/:page" element={<Navigate to="en" replace />} />
          <Route path="/:provider/:page/:language" element={<ProviderPageRoute />} />
        </Routes>
      </SingletonMapsProvider>
    </SamplePageLayout>
  );
}
