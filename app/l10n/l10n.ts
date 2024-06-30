import { locale, gt as translateString } from 'svelte-i18n-lingui';
import { derived } from 'svelte/store';

import { sourceLocale } from './list';

import { messages as en } from './locales/en/messages.json?lingui';
import { messages as de } from './locales/de/messages.json?lingui';
import { messages as fr } from './locales/fr/messages.json?lingui';
import { messages as it } from './locales/it/messages.json?lingui';
import { messages as es } from './locales/es/messages.json?lingui';
import { messages as pt } from './locales/pt/messages.json?lingui';
import { messages as pl } from './locales/pl/messages.json?lingui';
import { messages as ja } from './locales/ja/messages.json?lingui';
import { messages as zh } from './locales/zh/messages.json?lingui';

import { messages as ar } from './locales/ar/messages.json?lingui';
import { messages as cs } from './locales/cs/messages.json?lingui';
import { messages as da } from './locales/da/messages.json?lingui';
import { messages as el } from './locales/el/messages.json?lingui';
import { messages as fi } from './locales/fi/messages.json?lingui';
import { messages as nl } from './locales/nl/messages.json?lingui';
import { messages as no } from './locales/no/messages.json?lingui';
import { messages as ro } from './locales/ro/messages.json?lingui';
import { messages as ru } from './locales/ru/messages.json?lingui';
import { messages as sv } from './locales/sv/messages.json?lingui';
import { messages as uk } from './locales/uk/messages.json?lingui';

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

/** Alternative implementation with dynamic loading of locale files. Not used. */
/*
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
*/

let loadedLocale = false;
function initLocale() {
  let lang = localStorage.getItem("locale.ui") ?? navigator.language;
  setLocale(lang);
}

/** Used in Svelte files, e.g.
 * $t`Hello World!` or $t`Hello ${username}!` */
export const t = derived(locale, () => gt);

/** Used in .ts modules, e.g.
 * gt`Hello World!` or gt`Hello ${username}!` */
export function gt(descriptor, ...args) {
  if (!loadedLocale) {
    initLocale(); // setLocale() must be sync for this to work
    loadedLocale = true;
  }
  return translateString(descriptor, ...args);
}
