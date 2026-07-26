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
      <h2>{translate(language, 'Code example', 'コード例', 'Ejemplo de código')}</h2>
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
      <h3>{translate(language, 'How the code works', 'コードの読み方', 'Cómo funciona el código')}</h3>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </article>
  );
}
