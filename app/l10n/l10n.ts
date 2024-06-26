import { locale } from 'svelte-i18n-lingui';

export async function setLocale(lang) {
  // TODO: Have a better fallback system that checks whether the locale
  // is missing or if there's actually an error
  // Also fallback to the closest locale e.g. en-US fallsback to en
  try {
    const { messages } = await import(`./locales/${lang}/${lang}.ts`);
    locale.set(lang, messages);
  } catch (ex) {
    lang = 'en';
    const { messages } = await import(`./locales/${lang}/${lang}.ts`);
    locale.set(lang, messages);
  }
}