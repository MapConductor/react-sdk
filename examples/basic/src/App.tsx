import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { PageNav } from './components/PageNav';
import {
  DEFAULT_SAMPLE_PAGE,
  getSamplePageDefinition,
  getSamplePageMetadata,
  isKnownSamplePage,
  resolveProviderForPage,
} from './sampleRegistry';
import { SamplePageLayout } from './components/SamplePageLayout';
import { getLanguageFromPath } from './i18n';

type MapProvider = 'maplibre' | 'leaflet' | 'google' | 'google-3d';
const ClientMapRoutes = lazy(() => import('./ClientMapRoutes'));

function SeoProviderPageRoute() {
  const { provider, page, language: languageParam } = useParams<{ provider: string; page: string; language: string }>();
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);

  const requestedPage = isKnownSamplePage(page) ? page : DEFAULT_SAMPLE_PAGE;
  if (requestedPage !== page || (languageParam !== 'en' && languageParam !== 'ja')) {
    return <Navigate to={`/${provider ?? 'maplibre'}/${requestedPage}/${language}`} replace />;
  }
  if (provider !== 'maplibre' && provider !== 'maplibre-3d' && provider !== 'leaflet' && provider !== 'google-maps' && provider !== 'google-maps-3d') {
    return <Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/${language}`} replace />;
  }

  return (
    <SamplePageLayout
      page={requestedPage ?? DEFAULT_SAMPLE_PAGE}
      provider={provider ?? ''}
      language={language}
    />
  );
}

function CrawlableRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/maplibre/${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
      <Route path="/:provider" element={<Navigate to={`${DEFAULT_SAMPLE_PAGE}/en`} replace />} />
      <Route path="/:provider/:page" element={<Navigate to="en" replace />} />
      <Route path="/:provider/:page/:language" element={<SeoProviderPageRoute />} />
    </Routes>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mapsEnabled, setMapsEnabled] = useState(false);
  const language = getLanguageFromPath(location.pathname);

  // Keep the map providers out of the server render and the first hydration
  // pass. The route content above remains crawlable HTML, while the map is
  // mounted once in the browser and Google Maps can be reused between pages.
  useEffect(() => {
    setMapsEnabled(true);
  }, []);

  const currentProvider: MapProvider | null =
    location.pathname.startsWith('/maplibre-3d') ? 'maplibre' :
    location.pathname.startsWith('/maplibre') ? 'maplibre' :
    location.pathname.startsWith('/leaflet') ? 'leaflet' :
    location.pathname.startsWith('/google-maps-3d') ? 'google-3d' :
    location.pathname.startsWith('/google-maps') ? 'google' :
    null;
  const currentPage = location.pathname.split('/').filter(Boolean)[1] || DEFAULT_SAMPLE_PAGE;
  const showProviderSelector = getSamplePageDefinition(currentPage)?.showProviderSelector ?? true;

  useEffect(() => {
    const provider = location.pathname.split('/').filter(Boolean)[0];
    const metadata = getSamplePageMetadata(currentPage, provider, language);
    document.title = metadata.title;
    document.documentElement.lang = language;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.setAttribute('name', 'description');
      document.head.appendChild(description);
    }
    description.setAttribute('content', metadata.description);
  }, [currentPage, language, location.pathname]);

  const switchLanguage = (nextLanguage: 'en' | 'ja') => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const provider = pathParts[0] || 'maplibre';
    const page = pathParts[1] || DEFAULT_SAMPLE_PAGE;
    navigate(`/${provider}/${page}/${nextLanguage}`, { replace: true });
  };

  const switchProvider = (provider: MapProvider) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentPage = pathParts[1] || DEFAULT_SAMPLE_PAGE;
    const base = (() => {
      switch(provider) {
        case 'maplibre': {
          return `/${resolveProviderForPage('maplibre', currentPage)}`;
        }
        case 'leaflet': {
          return '/leaflet';
        }
        case 'google-3d': {
          return '/google-maps-3d';
        }
        default: {
          return '/google-maps';
        }
      }
    })();
    navigate(`${base}/${currentPage}/${language}`);
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
                <option value="leaflet">Leaflet</option>
                <option value="google">Google Maps</option>
                <option value="google-3d">Google Maps 3D</option>
              </select>
            </label>
          )}
          <label className="language-control">
            <span>{language === 'ja' ? '言語' : 'Language'}</span>
            <select
              value={language}
              onChange={event => switchLanguage(event.target.value as 'en' | 'ja')}
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </label>
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
          {mapsEnabled ? (
            <Suspense fallback={<CrawlableRoutes />}>
              <ClientMapRoutes />
            </Suspense>
          ) : (
            <CrawlableRoutes />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
