# mustang-autotranslate

`mustang-autotranslate` is a CLI tool that reads a directory of locales files and sends them to the translation service for translation, then saves the translated files back to the directory. It is a fork of [json-autotranslate](https://github.com/leolabs/json-autotranslate).

## Why did we choose this?

We initially used [Weblate](https://weblate.org), however it had several limitations:
- it kept a copy of the entire repository and it would break if we force-pushed on our master branch.
- the only way to fix it was to merge commit a messy history back to the master branch.
- there was no way to extract and translate using CI because you needed to click a button on the Weblate UI to trigger the translation.

Then we decided to use [json-autotranslate](https://github.com/leolabs/json-autotranslate) and it solved many of our problems, including:
- it could be used in the CLI which meant it could used on CI.
- it also supported ICU message formatting, which would mark the `{value}` as non-translatable strings before sending them to the translation service.

There were some features we needed for our specific use case that were not supported by `json-autotranslate`, so we forked it and added them. Those features include:
- sending some comments as context to the translation service.
- excluding some languages from the translation process.
- preserving existing translations.

Some of the features were not standard or it would be difficult to support them in a generic way so that's why it's not contributed back to the original project. However, we do contribute any changes that would be helpful to others back to the original project. We only use the DeepL translation service. And sometimes we need the changes soon and can't wait for the upstream maintainers to merge them.

## How does it work?

1. The package reads the locale files based on the `--input`, `--exclude` options.
2. The target languages are determined by the directory structure. We are using `[lang]/messages.json`.
3. Reads the source locale file and saves them to cache.
4. Reads the target locale files and saves them to cache.
5. Compares the files with cache and checks the are missing keys in the target locale files. If there are missing keys, it translates them using the DeepL API.
6. Retrieves the available languages and compares them with the target languages. If there's any missing target language on the DeepL API, it skips it and continues with the available languages.
7. The strings are interpolated and the `{value}` are replaced with `<span translate="no">0</span>`.
8. The interpolated strings are batched and sent to the DeepL API. Strings with comments are sent individually with `context` field included in the request.
9. If the service responds an error `429`, it retries the request after a delay.
10. After a successful request, the translated interpolated strings are replaced with the original `{value}` placeholders.
11. The translated strings are saved to the target locale files.

## Dependencies

### [json-autotranslate](https://github.com/leolabs/json-autotranslate)

Since the package is a fork of [json-autotranslate](https://github.com/leolabs/json-autotranslate), there may fixes for the issue you are experiencing. 

### DeepL

DeepL is the translation service we use so we need to support the DeepL API.

## Debugging

1. Check if [json-autotranslate](https://github.com/leolabs/json-autotranslate) has any fixes for the issue you are experiencing.
2. Check if there are any changes to the DeepL API that might be causing the issue.
3. If the issue persists, check whether if the issue is a missing file, check your command parameters.
4. Check if the issue is a file or directory is not being found or accessed correctly, check `index.ts` or `util/`.
5. Fix API and request issues in `services/deepl.ts`.

## Future improvements

### Progress tracking

It would be nice to see the progress of the translation process because since we have it set to higher quality translations, sometimes it seems like it is stuck.

### Better error messages

The error messages from the rejected `fetch()` are not shown to the user, instead it is just a generic error message from the package. This made debugging more difficult when the API key was incorrect because the error message was `Could not fetch supported languages from DeepL`.
