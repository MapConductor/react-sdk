import { isSupportedLanguage, type SupportedLanguage } from './sampleRegistry';
import { useLocation } from 'react-router-dom';

export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const language = pathname.split('/').filter(Boolean).at(-1);
  return isSupportedLanguage(language) ? language : 'en';
}

export function translate(
  language: SupportedLanguage,
  english: string,
  japanese: string,
  spanishLatinAmerica = english,
): string {
  if (language === 'ja') return japanese;
  if (language === 'es-419') return spanishLatinAmerica;
  return english;
}

export function useSampleI18n() {
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);
  return {
    language,
    t: (english: string, japanese: string, spanishLatinAmerica?: string) =>
      translate(language, english, japanese, spanishLatinAmerica),
  };
}
