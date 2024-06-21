import { jstsExtractor, svelteExtractor } from 'svelte-i18n-lingui/extractor';

export default {
	locales: ['en', 'es'],
	sourceLocale: 'en',
	catalogs: [
		{
			path: 'l10n/locales/{locale}/{locale}',
			include: [
        "frontend/**/*.ts",
        "frontend/**/*.js",
        "frontend/**/*.svelte",
        "logic/**/*.ts",
        "logic/**/*.js"
      ]
		}
	],
	extractors: [jstsExtractor, svelteExtractor]
};