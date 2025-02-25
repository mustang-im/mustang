import { jstsExtractor, svelteExtractor } from './l10n/extractor';
import {formatter} from "@lingui/format-json";
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
  format: formatter({style: 'minimal'}),
  extractors: [jstsExtractor, svelteExtractor],
};
