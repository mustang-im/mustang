import { sourceLocale, locales } from "./list";

export default {
  include: [
    "/frontend/**/*.{ts,js,svelte}",
    "logic/**/*.{ts,js}",
  ],
  path: "l10n/locales/**/messages.json",
  templateFile: "messages.template.json",
  sourceLocale: sourceLocale,
  locales: locales,
}