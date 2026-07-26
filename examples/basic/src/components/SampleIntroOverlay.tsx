import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '../samples/sampleRegistry';
import { translate } from '../samples/i18n';
import { getSampleIntro, hasSeenIntro, markIntroSeen } from '../samples/sampleIntro';

/**
 * A one-time instructional overlay drawn over the map stage. It dims the map
 * with a translucent scrim and shows a short "how to try this sample" dialog
 * (instruction text plus an optional GIF). Pressing the close button dismisses
 * it and records the page in memory, so it will not reappear until a reload.
 *
 * Rendering is deferred to the client: the module-level "seen" record only
 * exists in the browser, and gating on mount keeps the overlay out of the
 * server-rendered / statically generated HTML.
 */
export function SampleIntroOverlay({
  page,
  language,
}: {
  page: string;
  language: SupportedLanguage;
}) {
  const intro = getSampleIntro(page);
  const [visible, setVisible] = useState(false);
  const [gifOk, setGifOk] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (intro && !hasSeenIntro(page)) {
      setGifOk(true);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [page, intro]);

  const dismiss = useCallback(() => {
    markIntroSeen(page);
    setVisible(false);
  }, [page]);

  useEffect(() => {
    if (!visible) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, dismiss]);

  if (!intro || !visible) return null;

  const instruction = intro.instruction[language] ?? intro.instruction.en;

  return (
    <div
      className="sample-intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-intro-title"
      onClick={dismiss}
    >
      <div className="sample-intro-dialog" onClick={event => event.stopPropagation()}>
        <h2 id="sample-intro-title" className="sample-intro-title">
          {translate(language, 'How to try this sample', 'このサンプルの使い方', 'Cómo probar este ejemplo')}
        </h2>
        {intro.gif && gifOk && (
          <img
            className="sample-intro-gif"
            src={intro.gif}
            alt=""
            loading="lazy"
            onError={() => setGifOk(false)}
          />
        )}
        <p className="sample-intro-instruction">{instruction}</p>
        <button
          ref={closeButtonRef}
          type="button"
          className="sample-intro-close"
          onClick={dismiss}
        >
          {translate(language, 'Got it', '閉じる', 'Entendido')}
        </button>
      </div>
    </div>
  );
}
