/**
 * The languages the sample app is published in, and the shape a translated
 * string takes.
 *
 * Separate from sampleRegistry so that the page list, the documentation pages
 * and the UI can all reach the language type without pulling in the page data.
 */

export const SUPPORTED_LANGUAGES = ['en', 'ja', 'es-419', 'de', 'th', 'hi'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(language: string | undefined): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * One string in as many languages as have been written for it.
 *
 * English is required and the rest are optional, because `translate` falls back
 * to English: a phrase reaches the screen as soon as it exists, and a language
 * nobody has got to yet shows English rather than a blank. That was already the
 * rule under the positional `translate(language, en, ja, es?)` this replaced —
 * what changed is the shape.
 *
 * It had to change. Three languages read acceptably as three positions; six do
 * not, and every language added meant editing all 134 call sites to slot a new
 * argument into the right place. Named keys make the next one a data change.
 */
export type Phrase = Partial<Record<SupportedLanguage, string>> & { en: string };

/** Pick the current language out of a phrase, falling back to English. */
export function translate(language: SupportedLanguage, phrase: Phrase): string {
  return phrase[language] ?? phrase.en;
}
