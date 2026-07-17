import {
  getProviderLabel,
  getSamplePageDefinition,
  getSamplePageMetadata,
  type SupportedLanguage,
} from './sampleRegistry';

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
  const label = language === 'ja' ? definition?.labelJa ?? definition?.label : definition?.label;

  return (
    <section className="sample-page-seo" aria-labelledby="sample-page-title">
      <h2 id="sample-page-title">{metadata.title}</h2>
      <p>{metadata.description}</p>
      <p>
        {language === 'ja'
          ? `このインタラクティブサンプルでは、MapConductorの抽象APIを通じて${getProviderLabel(provider)}上で${label ?? '店舗マップ'}を実装します。`
          : `This interactive example demonstrates the ${label ?? 'Store Map'} feature through the MapConductor abstraction on ${getProviderLabel(provider)}.`}
      </p>
    </section>
  );
}
