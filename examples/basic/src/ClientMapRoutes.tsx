import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { SingletonGoogleMapsProvider } from './SingletonGoogleMaps';
import { SamplePageLayout } from './components/SamplePageLayout';
import { getLanguageFromPath } from './i18n';
import {
  DEFAULT_SAMPLE_PAGE,
  getSamplePageDefinition,
  isKnownSamplePage,
} from './sampleRegistry';
import { CirclePage } from './pages/CirclePage';
import { MapPage } from './pages/map/basic/StoreMapPage';
import { MarkerIconsPage } from './pages/marker/icons/MarkerIconsPage';
import { PolygonPage } from './pages/PolygonPage';
import { PolylinePage } from './pages/PolylinePage';
import { GroundImagePage } from './pages/groundimage/GroundImagePage';
import { MultipleBubblesPage } from './pages/infobubble/MultipleBubblesPage';
import { RichContentBubblePage } from './pages/infobubble/RichContentBubblePage';
import { SimpleInfoBubblePage } from './pages/infobubble/SimpleInfoBubblePage';
import { StyledInfoBubblePage } from './pages/infobubble/StyledInfoBubblePage';
import { MapDesignPage } from './pages/map/design/MapDesignPage';
import { FlyToPage } from './pages/map/flyto/FlyToPage';
import { TiltPage } from './pages/map/tilt/TiltPage';
import { VisibleRegionPage } from './pages/map/visibleregion/VisibleRegionPage';
import { CameraSyncPage } from './pages/map/camerasync/CameraSyncPage';
import { MarkerAnimationPage } from './pages/marker/animation/MarkerAnimationPage';
import { PostOfficePage } from './pages/marker/postoffice/PostOfficePage';
import { PostOfficeClusterPage } from './pages/marker/postofficecluster/PostOfficeClusterPage';
import { PolygonClickPage } from './pages/polygon/click/PolygonClickPage';
import { PolygonGeodesicPage } from './pages/polygon/geodesic/PolygonGeodesicPage';
import { PolygonHolePage } from './pages/polygon/hole/PolygonHolePage';
import { PolylineClickPage } from './pages/polyline/click/PolylineClickPage';
import { RasterLayerPage } from './pages/rasterlayer/RasterLayerPage';
import { HeatmapLayerPage } from './pages/heatmaplayer/HeatmapLayerPage';
import { BasicGeoJSONPage } from './pages/geojson/basic/BasicGeoJSONPage';
import { GeoJSONLayerPage } from './pages/geojson/layer/GeoJSONLayerPage';
import { ThreeJsObjectPage } from './pages/threejs/ThreeJsObjectPage';

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
  const requestedPage = isKnownSamplePage(page) ? page : DEFAULT_SAMPLE_PAGE;

  if (requestedPage !== page || (language !== 'en' && language !== 'ja')) {
    return <Navigate to={`/${provider ?? 'maplibre'}/${requestedPage}/${language === 'ja' ? 'ja' : 'en'}`} replace />;
  }
  if (provider !== 'maplibre' && provider !== 'maplibre-3d' && provider !== 'mapbox' && provider !== 'leaflet' && provider !== 'openlayers' && provider !== 'google-maps' && provider !== 'google-maps-3d' && provider !== 'arcgis' && provider !== 'arcgis-3d' && provider !== 'cesium') {
    return <Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/${language}`} replace />;
  }

  const isUnavailable = isPageUnavailableOnProvider(requestedPage, provider);
  return (
    <>
      {isUnavailable ? <MapPage /> : pageContent(page)}
      {isUnavailable && <ProviderUnavailableOverlay />}
    </>
  );
}

export default function ClientMapRoutes() {
  const location = useLocation();
  const [, provider = 'maplibre', routePage = DEFAULT_SAMPLE_PAGE] = location.pathname.split('/');
  const page = isKnownSamplePage(routePage) ? routePage : DEFAULT_SAMPLE_PAGE;
  const language = getLanguageFromPath(location.pathname);

  return (
    <SamplePageLayout page={page} provider={provider} language={language}>
      <SingletonGoogleMapsProvider>
        <Routes>
          <Route path="/" element={<Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
          <Route path="/:provider" element={<Navigate to={`${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
          <Route path="/:provider/:page" element={<Navigate to="en" replace />} />
          <Route path="/:provider/:page/:language" element={<ProviderPageRoute />} />
        </Routes>
      </SingletonGoogleMapsProvider>
    </SamplePageLayout>
  );
}
