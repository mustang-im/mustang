import { sanitize } from '../../lib/util/sanitizeDatatypes';
import { derived, writable } from 'svelte/store';
import { setLocale, t as translateString } from "svelte-icu-l10n";

import { sourceLocale } from './list';

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
import no from './locales/no/messages.json';
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

window.global = window; // Fix Stanza and getUILocale()

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

export function setUILocale(lang: string) {
  // This function *must* be sync, for gt() to work in TS modules

  // e.g. 'en' for 'en-US'
  let lang2 = lang.substring(0, 2);

  let availableLang =
    languageMessages[lang] ? lang :
    languageMessages[lang2] ? lang2 :
    sourceLocale;
  let messages = languageMessages[availableLang];
  locale.set(availableLang, messages);
}

function createLocale(defaultLocale = 'en-US', defaultMessages = {}) {
	const { subscribe, set } = writable(defaultLocale);
  
	return {
		subscribe,
		set: (locale, messages) => {
      setLocale(locale, messages);
			set(locale);
		},
	};
};
const locale = createLocale();

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
/** @returns ISO code for the locale that we are using */
export function getUILocale(): string {
  if (!cachedUILocale) {
    if ("localStorage" in global) {
      cachedUILocale = sanitize.nonemptystring(localStorage.getItem("ui.locale"), navigator.language);
    } else {
      cachedUILocale = "en-US";
    }
  }
  return cachedUILocale;
}

export function getUILocalePref() {
  return sanitize.nonemptystring(localStorage.getItem("ui.locale"), "");
}

export function saveUILocale(language: string) {
  localStorage.setItem("ui.locale", language);
  cachedUILocale = null;
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
