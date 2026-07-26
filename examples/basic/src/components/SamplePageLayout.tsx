import type { ReactNode } from 'react';
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
        <div className="sample-map-stage">
          {children ?? (
            <div className="sample-map-placeholder" aria-hidden="true">
              {translate(language, 'Loading map…', '地図を読み込んでいます…', 'Cargando el mapa…')}
            </div>
          )}
          <SampleIntroOverlay page={page} language={language} />
        </div>
      </div>
      <SampleDocumentation page={page} provider={provider} language={language} />
    </div>
  );
}
