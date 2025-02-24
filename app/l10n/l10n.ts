import { MessageFormatter, pluralTypeHandler, type FormatValues } from "@ultraq/icu-message-formatter";
import { derived, writable } from "svelte/store";
import { generateMessageID } from "./generateMessageID";
import { sanitize } from '../../lib/util/sanitizeDatatypes';

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

const handlers = { plural: pluralTypeHandler };
let formatter: MessageFormatter;
let messages: Record<string, string>;

/**
 * Cache is not needed since the all messages are loaded
 * on load and also the `@ultraq/icu-messageformatter`
 * caches the results of formatted messages
 * <https://github.com/ultraq/icu-message-formatter/blob/main/source/MessageFormatter.js#L78>
 */
function createLocale(defaultLocale = 'en-US', defaultMessages = {}) {
	const { subscribe, set } = writable(defaultLocale);

	// Necessary for plural to work; it expects a locale to be set.
  formatter = new MessageFormatter(defaultLocale, handlers);
  messages = defaultMessages;

	return {
		subscribe,
    /**
     * Sets the locale and loads the messages
     * @param locale 
     * @param msgs 
     */
		set: (locale: string, msgs: Record<string, string>) => {
      formatter = new MessageFormatter(locale, handlers);
      messages = msgs;
			set(locale);
		},
	};
}
export const locale = createLocale();

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
  let str: string = "";
  str = descriptor[0];
  args.forEach((_arg, i) => {
    str += `{${i}}` + descriptor[i + 1];
  });
  let context: string;
  // If the string is a single word generate an ID
  // based on the the fileName as context
  if (str.split(" ").length == 1) {
    context = URL.parse(getCallerFile()).pathname.split("/").pop().split(".").shift();
    console.log(context);
  }
  let msg: MessageDescriptor = {
    id: generateMessageID(str, context),
    defaultMessage: str,
    description: context,
  }
  let values = { ...args };

  return translateString(msg, values);
}

/**
 * Translates a plural message based on a number and variations
 * @param num
 * @param variations
 * @returns translated string
 */
export const plural = derived(locale, () => gPlural);

/**
 * Translates a plural message based on a number and variations
 * 
 * We need this to generate and match the variation according
 * to the number provided, we could just manually write ICU format
 * manually `{num, plural, variations}` but we're using this 
 * to avoid changing the entire code and also the manually written
 * on would be `{0, plural, variations}` because the placeholders
 * are numbers and that also changes the hashID and would require
 * us to retranslate.
 * @param num
 * @param variations
 * @returns translated string
 */
export function gPlural(num: number, variations: Record<string, string>) {
  let pluralOptions = "";
  Object.entries(variations).forEach(([key, value]) => {
    pluralOptions += ` ${key} {${value}}`;
  });
  let str = `{num, plural,${pluralOptions}}`;
  let message: MessageDescriptor = {
    id: generateMessageID(str),
    defaultMessage: str,
  };
  return translateString(message, { num });
}


/**
 * Translates based on a message descriptor and values
 * 
 * This default translation function that does the translation
 * and fallback handling for `t()` and `plural()`. Without
 * it the other function would not work. Since it is the entry point
 * for all translation functions, the `initLocale()` function is
 * called here instead
 * @param descriptor
 * @param values 
 * @returns translated string
 */
export function translateString(descriptor: MessageDescriptor, values: FormatValues): string {
  if (!loadedLocale) {
    initLocale(); // `setUILocale()` must be sync for this to work
    loadedLocale = true;
  }
  let message: string = messages[descriptor.id] ?? descriptor.defaultMessage;
  // This condition is for the <T> component extract error
  // where the message is the same as id which renders the id
  if (message == descriptor.id) {
    message = descriptor.defaultMessage;
  }
  try {
    // Throws an error if there's an syntax error
    // which returns undefined
    return formatter.format(message, values);
  } catch (ex) {
    // Fallback to parsing the defualt message
    // if the default message was not used to parse
    if (message != descriptor.defaultMessage) try {
      return formatter.format(message, values);
    } catch (ex) {
      // Fallback to unparsed message if the previous messages failed
      return message;
    }
  }
}

/**
 * Gets the fileName where the function is called.
 * We need this to get the more context for single word translations.
 * @returns fileName
 */
function getCallerFile(): string {
  let filename: string;

  let _pst = Error.prepareStackTrace
  Error.prepareStackTrace = function (err, stack) { return stack; };
  try {
      let err: Error = new Error();
      let callerfile: string;
      let currentfile: string;

      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
          callerfile = err.stack.shift().getFileName();

          if(currentfile !== callerfile) {
              filename = callerfile;
              break;
          }
      }
  } catch (ex) {}
  Error.prepareStackTrace = _pst;

  return filename;
}

export interface MessageDescriptor {
  id: string;
  defaultMessage: string;
  description?: string;
}