import { locale } from 'svelte-i18n-lingui';

export async function setLocale(lang) {
  const { messages } = await import(`../locales/${lang}/${lang}.ts`);
  locale.set(lang, messages);
}