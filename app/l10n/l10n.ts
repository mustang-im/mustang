import { sanitize } from '../../lib/util/sanitizeDatatypes';
import { locale, gt as translateString } from 'svelte-i18n-lingui';
import { derived } from 'svelte/store';

import { sourceLocale } from './list';

import { messages as en } from './locales/en/messages-compiled.json';
import { messages as de } from './locales/de/messages-compiled.json';
import { messages as fr } from './locales/fr/messages-compiled.json';
import { messages as it } from './locales/it/messages-compiled.json';
import { messages as es } from './locales/es/messages-compiled.json';
import { messages as pt } from './locales/pt/messages-compiled.json';
import { messages as pl } from './locales/pl/messages-compiled.json';
import { messages as ja } from './locales/ja/messages-compiled.json';
import { messages as zh } from './locales/zh/messages-compiled.json';

import { messages as ar } from './locales/ar/messages-compiled.json';
import { messages as cs } from './locales/cs/messages-compiled.json';
import { messages as da } from './locales/da/messages-compiled.json';
import { messages as el } from './locales/el/messages-compiled.json';
import { messages as fi } from './locales/fi/messages-compiled.json';
import { messages as nl } from './locales/nl/messages-compiled.json';
import { messages as no } from './locales/no/messages-compiled.json';
import { messages as ro } from './locales/ro/messages-compiled.json';
import { messages as ru } from './locales/ru/messages-compiled.json';
import { messages as sv } from './locales/sv/messages-compiled.json';
import { messages as uk } from './locales/uk/messages-compiled.json';

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

export function setUILocale(lang: string) {
  // This function *must* be sync, for gt() to work in TS modules

  // e.g. 'en' for 'en-US'
  let lang2 = lang.substring(0, 2);

  let availableLang = cachedUILocale =
    languageMessages[lang] ? lang :
    languageMessages[lang2] ? lang2 :
    sourceLocale;
  let messages = languageMessages[availableLang];
  locale.set(availableLang, messages);
}

/** Alternative implementation with dynamic loading of locale files. Not used. */
/*
export async function setUILocaleAsync(lang: string) {
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

let cachedUILocale: string;
/** @returns 2-letter ISO code for the language that we are using */
export function getUILocale(): string {
  if (cachedUILocale) {
    return cachedUILocale;
  }
  return sanitize.nonemptystring(localStorage.getItem("ui.locale"), navigator.language);
}

export function saveUILocale(language: string) {
  localStorage.setItem("ui.locale", language);
}

let loadedLocale = false;
function initLocale() {
  setUILocale(getUILocale());
}

/** Used in Svelte files, e.g.
 * $t`Hello World!` or $t`Hello ${username}!` */
export const t = derived(locale, () => gt);

/** Used in .ts modules, e.g.
 * gt`Hello World!` or gt`Hello ${username}!` */
export function gt(descriptor, ...args) {
  if (!loadedLocale) {
    initLocale(); // `setUILocale()` must be sync for this to work
    loadedLocale = true;
  }
  return translateString(descriptor, ...args);
}
