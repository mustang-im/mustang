import { jstsExtractor, svelteExtractor } from './l10n/extractor';
import { formatter } from "./l10n/formatter";
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
  format: formatter(),
  extractors: [jstsExtractor, svelteExtractor],
};
