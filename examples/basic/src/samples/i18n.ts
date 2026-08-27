import { isSupportedLanguage, translate, type Phrase, type SupportedLanguage } from './language';
import { useLocation } from 'react-router-dom';

export { translate } from './language';
export type { Phrase } from './language';

export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const language = pathname.split('/').filter(Boolean).at(-1);
  return isSupportedLanguage(language) ? language : 'en';
}

export function useSampleI18n() {
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);
  return {
    language,
    t: (phrase: Phrase) => translate(language, phrase),
  };
}
