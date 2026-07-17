import type { SupportedLanguage } from './sampleRegistry';
import { useLocation } from 'react-router-dom';

export function getLanguageFromPath(pathname: string): SupportedLanguage {
  return pathname.split('/').filter(Boolean).at(-1) === 'ja' ? 'ja' : 'en';
}

export function useSampleI18n() {
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);
  return {
    language,
    t: (english: string, japanese: string) => language === 'ja' ? japanese : english,
  };
}
