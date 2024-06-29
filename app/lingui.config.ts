import { jstsExtractor, svelteExtractor } from 'svelte-i18n-lingui/extractor';

export default {
	locales: ['ar','cs','da','de','el','en','es','fi','fr',
    'it','ja','nl','no','pl','pt','ro','ru','sv','uk','zh'
  ],
	sourceLocale: 'en',
	catalogs: [
		{
			path: 'l10n/locales/{locale}/messages',
			include: [
        "frontend/",
        "logic/",
      ]
		}
	],
	extractors: [jstsExtractor, svelteExtractor]
};