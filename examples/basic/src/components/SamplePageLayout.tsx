import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SupportedLanguage } from '../samples/sampleRegistry';
import { SamplePageSeo } from '../samples/SamplePageSeo';
import { SampleDocumentation } from './SampleDocumentation';
import { SampleIntroOverlay } from './SampleIntroOverlay';
import { translate } from '../samples/i18n';

export function SamplePageLayout({
  page,
  provider,
  language,
  children,
}: {
  page: string;
  provider: string;
  language: SupportedLanguage;
  children?: ReactNode;
}) {
  const { stageRef, fullscreen, toggleFullscreen } = useMapFullscreen();
  const labels = {
    enter: translate(language, { en: 'Full screen', ja: '全画面表示', 'es-419': 'Pantalla completa', de: 'Vollbild', th: 'เต็มหน้าจอ', hi: 'फ़ुल स्क्रीन' }),
    exit: translate(language, { en: 'Exit full screen', ja: '全画面表示を終了', 'es-419': 'Salir de pantalla completa', de: 'Vollbild beenden', th: 'ออกจากโหมดเต็มหน้าจอ', hi: 'फ़ुल स्क्रीन से बाहर निकलें' }),
  };
  // The Hello Map tutorial is a full-page article (its own live demo + steps),
  // not the standard map-stage + documentation layout.
  if (page === 'hello-map') {
    return (
      <div className="sample-page-layout hello-map-page">
        <SamplePageSeo page={page} provider={provider} language={language} />
        {children}
      </div>
    );
  }

  return (
    <div className="sample-page-layout">
      <SamplePageSeo page={page} provider={provider} language={language} />
      <div className="sample-map-padding">
        <div ref={stageRef} className={`sample-map-stage${fullscreen ? ' is-fullscreen' : ''}`}>
          {/* Camera Sync has its own full screen, for both of its maps. */}
          {page !== 'camera-sync' && <button
            type="button"
            className="map-fullscreen-button"
            aria-pressed={fullscreen}
            aria-label={fullscreen ? labels.exit : labels.enter}
            title={fullscreen ? labels.exit : labels.enter}
            onClick={toggleFullscreen}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              {fullscreen ? (
                <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>}
          {children ?? (
            <div className="sample-map-placeholder" aria-hidden="true">
              {translate(
                language,
                {
                  en: 'Loading map…',
                  ja: '地図を読み込んでいます…',
                  'es-419': 'Cargando el mapa…',
                  de: 'Karte wird geladen…',
                  th: 'กำลังโหลดแผนที่…',
                  hi: 'मैप लोड हो रहा है…',
                },
              )}
            </div>
          )}
          <SampleIntroOverlay page={page} language={language} />
        </div>
      </div>
      <SampleDocumentation page={page} provider={provider} language={language} />
    </div>
  );
}

/**
 * Full screen for the map stage. The Fullscreen API where there is one; where
 * there is not (iPhone Safari has none for a div), the stage is fixed over the
 * whole page instead. Escape leaves either way. The maps live inside the stage
 * (SingletonMaps), so they grow with it.
 */
function useMapFullscreen() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Maps that size themselves on window resize only (not every SDK watches its container).
  const announceResize = () => requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));

  const toggleFullscreen = useCallback(() => {
    const stage = stageRef.current;
    if (!fullscreen) {
      setFullscreen(true);
      stage?.requestFullscreen?.().catch(() => {});
    } else {
      setFullscreen(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
    announceResize();
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    // Leaving native full screen (the system back gesture, Escape) ends ours too.
    const onChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
        announceResize();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) {
        setFullscreen(false);
        announceResize();
      }
    };
    // The page behind must not scroll under the fixed stage.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('keydown', onKey);
    };
  }, [fullscreen]);

  return { stageRef, fullscreen, toggleFullscreen };
}
