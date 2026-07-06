import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { PageNav } from './components/PageNav';
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
import { DEFAULT_SAMPLE_PAGE, getSamplePageDefinition, isKnownSamplePage } from './sampleRegistry';

type MapProvider = 'maplibre' | 'google' | 'google-3d';

function providerRouteId(provider: string | undefined): string {
  return provider ?? '';
}

function isPageUnavailableOnProvider(page: string | undefined, provider: string | undefined): boolean {
  const definition = getSamplePageDefinition(page);
  return definition?.unavailableProviders?.includes(providerRouteId(provider)) ?? false;
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
    default: return <MapPage />;
  }
}

function ProviderPageRoute() {
  const { provider, page } = useParams<{ provider: string; page: string }>();

  const requestedPage = isKnownSamplePage(page) ? page : DEFAULT_SAMPLE_PAGE;
  if (requestedPage !== page) return <Navigate to={`../${requestedPage}`} replace />;
  if (provider !== 'maplibre' && provider !== 'google-maps' && provider !== 'google-maps-3d') {
    return <Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}`} replace />;
  }

  const isUnavailable = isPageUnavailableOnProvider(requestedPage, provider);

  return (
    <>
      {isUnavailable ? <MapPage /> : pageContent(page)}
      {isUnavailable && <ProviderUnavailableOverlay />}
    </>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentProvider: MapProvider | null =
    location.pathname.startsWith('/maplibre') ? 'maplibre' :
    location.pathname.startsWith('/google-maps-3d') ? 'google-3d' :
    location.pathname.startsWith('/google-maps') ? 'google' :
    null;
  const currentPage = location.pathname.split('/').filter(Boolean)[1] || DEFAULT_SAMPLE_PAGE;
  const showProviderSelector = getSamplePageDefinition(currentPage)?.showProviderSelector ?? true;

  const switchProvider = (provider: MapProvider) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentPage = pathParts[1] || DEFAULT_SAMPLE_PAGE;
    const base = provider === 'maplibre' ? '/maplibre' : provider === 'google-3d' ? '/google-maps-3d' : '/google-maps';
    const params = new URLSearchParams(location.search);
    params.delete('design');
    navigate(`${base}/${currentPage}${params.size > 0 ? `?${params.toString()}` : ''}`);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app">
      <header className="header">
        <h1>MapConductor React SDK Samples</h1>
        <div className="header-controls">
          <button
            type="button"
            className="menu-button"
            aria-label="Open samples menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          {showProviderSelector && (
            <label className="provider-control">
              <span>Provider</span>
              <select
                value={currentProvider ?? 'maplibre'}
                onChange={event => switchProvider(event.target.value as MapProvider)}
              >
                <option value="maplibre">MapLibre</option>
                <option value="google">Google Maps</option>
                <option value="google-3d">Google Maps 3D</option>
              </select>
            </label>
          )}
        </div>
      </header>

      <div className="app-body">
        <PageNav />
        <div
          className={['mobile-menu-scrim', isMenuOpen ? 'open' : ''].filter(Boolean).join(' ')}
          onClick={() => setIsMenuOpen(false)}
        />
        <div className={['mobile-menu-drawer', isMenuOpen ? 'open' : ''].filter(Boolean).join(' ')}>
          <PageNav onNavigate={() => setIsMenuOpen(false)} />
        </div>
        <main className="map-container">
          <Routes>
            <Route path="/" element={<Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}`} replace />} />
            <Route path="/:provider" element={<Navigate to={DEFAULT_SAMPLE_PAGE} replace />} />
            <Route path="/:provider/:page" element={<ProviderPageRoute />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
