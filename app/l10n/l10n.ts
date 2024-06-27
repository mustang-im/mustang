import { locale } from 'svelte-i18n-lingui';

const reLang: RegExp = /[a-z]{0,2}/;

export async function setLocale(lang: string) {
  // TODO: Have a better fallback system that checks whether the locale
  // is missing or if there's actually an error
  // Support different variants of the same language i.e. en-US en-AU

  // Extract only the 'en' from 'en-US'
  lang = lang.match(reLang)[0];

  try {
    const { messages } = await import(`./locales/${lang}/${lang}.ts`);
    locale.set(lang, messages);
  } catch (ex) {
    lang = 'en';
    const { messages } = await import(`./locales/${lang}/${lang}.ts`);
    locale.set(lang, messages);
  }
}