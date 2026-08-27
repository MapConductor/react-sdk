import type { SupportedLanguage } from '../samples/sampleRegistry';
import { getSampleDocumentation } from '../samples/documentation';
import { Highlight, themes } from 'prism-react-renderer';
import { translate } from '../samples/i18n';

export function SampleDocumentation({
  page,
  provider,
  language,
}: {
  page: string;
  provider: string;
  language: SupportedLanguage;
}) {
  const documentation = getSampleDocumentation(page, provider, language);
  const paragraphs = documentation.explanation[language] ?? documentation.explanation.en;
  return (
    <article className="sample-documentation">
      <h2>{translate(
        language,
        {
          en: 'Code example',
          ja: 'コード例',
          'es-419': 'Ejemplo de código',
          de: 'Codebeispiel',
          th: 'ตัวอย่างโค้ด',
          hi: 'कोड उदाहरण',
        },
      )}</h2>
      <Highlight theme={themes.nightOwl} code={documentation.code} language="tsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} sample-code`} style={style}>
            <code>
              {tokens.map((line, lineIndex) => (
                <span key={lineIndex} {...getLineProps({ line })} className="sample-code-line">
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
      <h3>{translate(
        language,
        {
          en: 'How the code works',
          ja: 'コードの読み方',
          'es-419': 'Cómo funciona el código',
          de: 'Wie der Code funktioniert',
          th: 'โค้ดนี้ทำงานอย่างไร',
          hi: 'कोड कैसे काम करता है',
        },
      )}</h3>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </article>
  );
}
