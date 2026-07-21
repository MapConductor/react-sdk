import type { ReactNode } from 'react';
import type { SupportedLanguage } from '../sampleRegistry';
import { SamplePageSeo } from '../SamplePageSeo';
import { SampleDocumentation } from './SampleDocumentation';
import { translate } from '../i18n';

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
        </div>
      </div>
      <SampleDocumentation page={page} provider={provider} language={language} />
    </div>
  );
}
