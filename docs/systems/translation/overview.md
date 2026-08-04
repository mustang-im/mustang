# Overview

The translation system extracts strings for translation, translates the strings into different languages and displays the strings in the selected language.

## Components

The translation systems is made of different components and they function well together.

- GitHub workflow: runs the following components, commits and pushes the translations
- `app/l10n`
  - extractor: extracts strings from the repository for translation
  - l10n: displays the strings in the selected language
- `mustang-autotranslate`: a package maintained by mustang-im for sending strings to the translation service and writing the translation to the JSON files

## How does it work?

### Translating on CI

1. Installs dependencies because the preprocessors and Svelte compiler and TS parser are needed for extracting strings
2. Runs `yarn l10n:extract`, which extracts the strings
3. Strings are extract and written to the `app/l10n/locales/messages/en/messages.json``app/l10n/locales/messages/en/messages.template.json`
4. Strings and comments (`*=>`) are written to `app/l10n/locales/messages/en/messages.template.json`
5. Runs `yarn l10n:auto-translate`, which runs `mustang-autotranslate`
6. The strings with comments from `app/l10n/locales/messages/en/messages.template.json` are sent to DeepL for translation. GitHub Action secrets `DEEPL_API_KEY` is used to authenticate with DeepL.
7. After translated strings are returned by DeepL, it is written to `app/l10n/locales/messages/[target language]/messages.json`
8. `app/l10n/locales/messages/en/messages.template.json` is ignored but changes in `app/l10n/locales/messages/en/messages.template.json` and `app/l10n/locales/messages/[target language]/messages.json` are pushed to the `master` branch for the repository as the GitHub Actions bot
