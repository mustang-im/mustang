import { locale } from 'svelte-i18n-lingui';
import { sourceLocale } from './list';

import { messages as en } from './locales/en/messages';
import { messages as de } from './locales/de/messages';
import { messages as fr } from './locales/fr/messages';
import { messages as it } from './locales/it/messages';
import { messages as es } from './locales/es/messages';
import { messages as pt } from './locales/pt/messages';
import { messages as pl } from './locales/pl/messages';
import { messages as ja } from './locales/ja/messages';
import { messages as zh } from './locales/zh/messages';

import { messages as ar } from './locales/ar/messages';
import { messages as cs } from './locales/cs/messages';
import { messages as da } from './locales/da/messages';
import { messages as el } from './locales/el/messages';
import { messages as fi } from './locales/fi/messages';
import { messages as nl } from './locales/nl/messages';
import { messages as no } from './locales/no/messages';
import { messages as ro } from './locales/ro/messages';
import { messages as ru } from './locales/ru/messages';
import { messages as sv } from './locales/sv/messages';
import { messages as uk } from './locales/uk/messages';

/** Map of lang code to messages.
 * Lang codes: <https://www.wikiwand.com/en/List_of_ISO_639_language_codes> */
const languageMessages = {
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
  no: no,
  ro: ro,
  ru: ru,
  sv: sv,
  uk: uk,
};

export function setLocale(lang: string) {
  // e.g. 'en' for 'en-US'
  let lang2 = lang.substring(0, 2);

  let availableLang = languageMessages[lang] ? lang :
    languageMessages[lang2] ? lang2 :
    sourceLocale;
  let messages = languageMessages[availableLang];
  locale.set(availableLang, messages);
}

/** Alternative implementation with dynamic loading of locale files. */
export async function setLocaleAsync(lang: string) {
  // e.g. 'en' for 'en-US'
  let lang2 = lang.substring(0, 2);

  try {
    lang = lang2;
    const { messages } = await import(`./locales/${lang}/messages.ts`);
    locale.set(lang, messages);
  } catch (ex) {
    lang = 'en';
    const { messages } = await import(`./locales/${lang}/messages.ts`);
    locale.set(lang, messages);
  }
}
