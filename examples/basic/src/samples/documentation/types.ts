import type { SupportedLanguage } from '../sampleRegistry';

/**
 * One sample page's documentation content.
 *
 * Each page keeps its render snippet, its `(2) state` setup and every language's
 * prose in a single file under `./pages`, so adding or editing a page is a local
 * change. The code generator in `./index.ts` assembles these into the full,
 * provider-specific snippet shown by the docs component.
 */
export interface SamplePageDoc {
  /** The render JSX snippet, using `<MapViewContainer>` as the provider placeholder. */
  code: string;
  /** The `(2)` React state and data setup for the page (omitted when there is none). */
  state?: string;
  /**
   * Prose explanation of the snippet, one entry per supported language.
   *
   * Each language maps to an array of page-specific paragraphs. The content is
   * deliberately unique per page — the docs component renders these paragraphs
   * verbatim and no longer adds shared boilerplate, so search engines see
   * distinct text on every sample page instead of duplicated copy.
   */
  explanation: Record<SupportedLanguage, string[]>;
}
