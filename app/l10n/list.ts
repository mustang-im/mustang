export const sourceLocale = 'en';

/* List of languages, as shown in the settings UI.
 * Do *not* translate these.
 * (Otherwise, if you do cannot read Chinese, you cannot find German anymore.)
 * Lang codes: <https://www.wikiwand.com/en/List_of_ISO_639_language_codes> */
export const localeNames = {
  'ar': "Arabic / اَلْعَرَبِيَّةُ",
  'az': "Azerbaijani / Azərbaycan dili",
  'bg': "Bulgarian / Български",
//  'bn': "Bengali / বাংলা",
  'cs': "Czech / Čeština",
  'da': "Danish / Dansk",
  'de': "German / Deutsch",
  'el': "Greek / Ελληνικά",
  'en': "English",
  'eo': "Esperanto",
  'es': "Spanish / Español",
  'et': "Estonian / Eesti keel",
  'fa': "Persian / فارسی",
  'fi': "Finnish / Suomi",
  'fr': "French / Français",
  'ga': "Irish / Gaeilge",
  'he': "Hebrew / עברית",
  'hi': "Hindi / हिन्दी",
  'hu': "Hungarian / Magyar nyelv",
  'id': "Indonesian / bahasa Indonesia",
  'it': "Italian / Italiano",
  'ja': "Japanese / 日本語",
  'ko': "Korean / 한국어",
  'lt': "Lithuanian / Lietuviškai",
  'lv': "Latvian / Latviski",
//  'ms': "Malay / بهاس ملايو",
  'nb': "Norwegian Bokmål / Norsk Bokmål",
  'nl': "Dutch / Nederlands",
  // 'no': "Norwegian / Norsk",
  'pl': "Polish / Polski",
  'pt': "Portuguese / Português",
  'ro': "Romanian / Românește",
  'ru': "Russian / Русский язык",
  'sk': "Slovak / Slovenčina",
  'sl': "Slovenian / Slovenščina",
//  'sq': "Albanian / Shqip",
  'sv': "Swedish / Svenska",
  'th': "Thai / ภาษาไทย",
//  'tl': "Tagalog / Wikang Tagalog",
  'tr': "Turkish / Türkçe",
  'uk': "Ukranian / Українська",
//  'ur': "Urdu / اُردُو",
//  'vi': "Vietnamese / tiếng Việt",
  'zh': "Simplified Chinese / 简体中文",
};

/** List of available locales in this build.
 * Must match ./locales/<locale>/* files and
 * the imports in ./l10n.ts. */
export const locales = Object.keys(localeNames);

export const rtlLocales = [ 'ar', 'fa', 'he', 'ur' ];

// Cannot be placed in l10n.ts because
// `window.global = window;` causes an error
// also in config.ts because of the plugin
export const commentSymbol = " *=> ";
