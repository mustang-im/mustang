export const sourceLocale = 'en';

/* List of languages, as shown in the settings UI.
 * Do *not* translate these.
 * (Otherwise, if you do cannot read Chinese, you cannot find German anymore.)
 * Lang codes: <https://www.wikiwand.com/en/List_of_ISO_639_language_codes> */
export const localeNames = {
  'ar': "Arabic / اَلْعَرَبِيَّةُ",
  'cs': "Czech / Čeština",
  'da': "Danish / Dansk",
  'de': "German / Deutsch",
  'el': "Greek / Ελληνικά",
  'en': "English",
  'es': "Spanish / Español",
  'fi': "Finnish / Suomi",
  'fr': "French / Français",
  'it': "Italian / Italiano",
  'ja': "Japanese / 日本語",
  'nl': "Dutch / Nederlands",
  'no': "Norwegian / Norsk",
  'pl': "Polish / Polski",
  'pt': "Portuguese / Português",
  'ro': "Romanian / Românește",
  'ru': "Russian / Русский язык",
  'sv': "Swedish / Svenska",
  'uk': "Ukranian / Українська",
  'zh': "Simplified Chinese (Taiwan) / 简体中文",
};

/** List of available locales in this build.
 * Must match ./locales/<locale>/* files and
 * the imports in ./l10n.ts. */
export const locales = Object.keys(localeNames);

export const rtlLocales = [ 'ar' ];
