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
          {
            en: `This interactive example demonstrates the ${label ?? 'Store Map'} feature through the MapConductor abstraction on ${getProviderLabel(provider)}.`,
            ja: `このインタラクティブサンプルでは、MapConductorの抽象APIを通じて${getProviderLabel(provider)}上で${label ?? '店舗マップ'}を実装します。`,
            'es-419': `Este ejemplo interactivo muestra ${label ?? 'el mapa de tiendas'} mediante la abstracción de MapConductor sobre ${getProviderLabel(provider)}.`,
            de: `Dieses interaktive Beispiel zeigt ${label ?? 'Filialkarte'} über die MapConductor-Abstraktion auf ${getProviderLabel(provider)}.`,
            th: `ตัวอย่างเชิงโต้ตอบนี้แสดง ${label ?? 'แผนที่ร้านค้า'} ผ่านการห่อหุ้มของ MapConductor บน ${getProviderLabel(provider)}`,
            hi: `यह इंटरैक्टिव उदाहरण ${getProviderLabel(provider)} पर MapConductor की एब्स्ट्रैक्शन के ज़रिए ${label ?? 'स्टोर मैप'} दिखाता है।`,
          },
        )}
      </p>
    </section>
  );
}
