import en from './locales/en/messages.json';
import de from './locales/de/messages.json';
import fr from './locales/fr/messages.json';
import it from './locales/it/messages.json';
import es from './locales/es/messages.json';
import pt from './locales/pt/messages.json';
import pl from './locales/pl/messages.json';
import ja from './locales/ja/messages.json';
import zh from './locales/zh/messages.json';

import ar from './locales/ar/messages.json';
import cs from './locales/cs/messages.json';
import da from './locales/da/messages.json';
import el from './locales/el/messages.json';
import fi from './locales/fi/messages.json';
import nl from './locales/nl/messages.json';
import ro from './locales/ro/messages.json';
import ru from './locales/ru/messages.json';
import sv from './locales/sv/messages.json';
import uk from './locales/uk/messages.json';

import az from './locales/az/messages.json';
import eo from './locales/eo/messages.json';
import fa from './locales/fa/messages.json';
import ga from './locales/ga/messages.json';
import he from './locales/he/messages.json';
import hi from './locales/hi/messages.json';
import hu from './locales/hu/messages.json';
import id from './locales/id/messages.json';
import ko from './locales/ko/messages.json';
import sk from './locales/sk/messages.json';
import th from './locales/th/messages.json';
import tr from './locales/tr/messages.json';

/** Map of lang code to messages.
 * Lang codes: <https://www.wikiwand.com/en/List_of_ISO_639_language_codes> */
export const languageMessages = {
  en: en,
  de: de,
  fr: fr,
  it: it,
  es: es,
  pt: pt,
  pl: pl,
  ja: ja,
  zh: zh,
  ar: ar,
  cs: cs,
  da: da,
  el: el,
  fi: fi,
  nl: nl,
  ro: ro,
  ru: ru,
  sv: sv,
  uk: uk,
  az: az,
  eo: eo,
  fa: fa,
  ga: ga,
  he: he,
  hi: hi,
  hu: hu,
  id: id,
  ko: ko,
  sk: sk,
  th: th,
  tr: tr,
};

export const sourceLocale = 'en';

/* List of languages, as shown in the settings UI.
 * Do *not* translate these.
 * (Otherwise, if you do cannot read Chinese, you cannot find German anymore.)
 * Lang codes: <https://www.wikiwand.com/en/List_of_ISO_639_language_codes> */
export const localeNames = {
  'ar': "Arabic / اَلْعَرَبِيَّةُ",
  'az': "Azerbaijani / Azərbaycan dili",
  'bg': "Bulgarian / Български",
  //'bn': "Bengali / বাংলা",
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
  //'ms': "Malay / بهاس ملايو",
  'nb': "Norwegian Bokmål / Norsk Bokmål",
  'nl': "Dutch / Nederlands",
  //'no': "Norwegian / Norsk",
  'pl': "Polish / Polski",
  'pt': "Portuguese / Português",
  'ro': "Romanian / Românește",
  'ru': "Russian / Русский язык",
  'sk': "Slovak / Slovenčina",
  'sl': "Slovenian / Slovenščina",
  //'sq': "Albanian / Shqip",
  'sv': "Swedish / Svenska",
  'th': "Thai / ภาษาไทย",
  //'tl': "Tagalog / Wikang Tagalog",
  'tr': "Turkish / Türkçe",
  'uk': "Ukranian / Українська",
  //'ur': "Urdu / اُردُو",
  //'vi': "Vietnamese / tiếng Việt",
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
// TODO move it back to l10n.ts, now that `window.global` was removed
export const commentSymbol = " *=> ";
