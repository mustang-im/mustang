import { jstsExtractor, svelteExtractor } from 'svelte-i18n-lingui/extractor';
import { locales, sourceLocale } from './l10n/list';

export default {
  locales: locales,
  sourceLocale: sourceLocale,
  catalogs: [
    {
      path: 'l10n/locales/{locale}/messages',
      include: [
        "frontend/",
        "logic/",
      ]
    }
  ],
  extractors: [jstsExtractor, svelteExtractor],
};
