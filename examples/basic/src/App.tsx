import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLanguageFromPath } from './i18n';
import { getSamplePageDefinition, getSamplePageMetadata, type SupportedLanguage } from './sampleRegistry';
import { AppHeader } from './app/AppHeader';
import { AppNavigation } from './app/AppNavigation';
import {
  CrawlableRoutes,
  parseSamplePath,
  providerPath,
  samplePath,
  type MapProvider,
} from './app/appRouting';

const ClientMapRoutes = lazy(() => import('./ClientMapRoutes'));

function updatePageMetadata(page: string, provider: string, language: SupportedLanguage) {
  const metadata = getSamplePageMetadata(page, provider, language);
  document.title = metadata.title;
  document.documentElement.lang = language;
  let description = document.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement('meta');
    description.setAttribute('name', 'description');
    document.head.appendChild(description);
  }
  description.setAttribute('content', metadata.description);
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapsEnabled, setMapsEnabled] = useState(false);
  const language = getLanguageFromPath(location.pathname);
  const { providerPath: currentProviderPath, page, provider } = parseSamplePath(location.pathname);
  const showProviderSelector = getSamplePageDefinition(page)?.showProviderSelector ?? true;

  useEffect(() => setMapsEnabled(true), []);
  useEffect(() => {
    updatePageMetadata(page, currentProviderPath, language);
    setIsMenuOpen(false);
  }, [currentProviderPath, language, page]);

  const switchProvider = (nextProvider: MapProvider) => {
    navigate(samplePath(providerPath(nextProvider, page), page, language));
  };
  const switchLanguage = (nextLanguage: SupportedLanguage) => {
    navigate(samplePath(currentProviderPath, page, nextLanguage), { replace: true });
  };

  return (
    <div className="app">
      <AppHeader
        language={language}
        provider={provider}
        showProviderSelector={showProviderSelector}
        onOpenMenu={() => setIsMenuOpen(true)}
        onProviderChange={switchProvider}
        onLanguageChange={switchLanguage}
      />
      <div className="app-body">
        <AppNavigation
          menuOpen={isMenuOpen}
          sidebarOpen={isSidebarOpen}
          onCloseMenu={() => setIsMenuOpen(false)}
          onToggleSidebar={() => setIsSidebarOpen(open => !open)}
        />
        <main className="map-container">
          {mapsEnabled
            ? <Suspense fallback={<CrawlableRoutes />}><ClientMapRoutes /></Suspense>
            : <CrawlableRoutes />}
        </main>
      </div>
    </div>
  );
}
