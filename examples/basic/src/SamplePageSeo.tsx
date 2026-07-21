import {
  getProviderLabel,
  getSamplePageLabel,
  getSamplePageDefinition,
  getSamplePageMetadata,
  type SupportedLanguage,
} from './sampleRegistry';
import { translate } from './i18n';

export function SamplePageSeo({
  page,
  provider,
  language,
}: {
  page: string;
  provider: string;
  language: SupportedLanguage;
}) {
  const definition = getSamplePageDefinition(page);
  const metadata = getSamplePageMetadata(page, provider, language);
  const label = definition ? getSamplePageLabel(definition, language) : undefined;

  return (
    <section className="sample-page-seo" aria-labelledby="sample-page-title">
      <h2 id="sample-page-title">{metadata.title}</h2>
      <p>{metadata.description}</p>
      <p>
        {translate(
          language,
          `This interactive example demonstrates the ${label ?? 'Store Map'} feature through the MapConductor abstraction on ${getProviderLabel(provider)}.`,
          `このインタラクティブサンプルでは、MapConductorの抽象APIを通じて${getProviderLabel(provider)}上で${label ?? '店舗マップ'}を実装します。`,
          `Este ejemplo interactivo muestra ${label ?? 'el mapa de tiendas'} mediante la abstracción de MapConductor sobre ${getProviderLabel(provider)}.`,
        )}
      </p>
    </section>
  );
}
