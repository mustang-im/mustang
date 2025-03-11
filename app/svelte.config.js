import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  // <https://github.com/sveltejs/language-tools/issues/650#issuecomment-1181354795>
  onwarn: (warning, handler) => {
    if (ignoreSvelteCompilerWarnings.includes(warning.code)) {
      return;
    }
    handler(warning);
  },
}

const ignoreSvelteCompilerWarnings = [
  "a11y-autofocus",
  "a11y-mouse-events-have-key-events",
  "a11y-click-events-have-key-events",
  "a11y-no-noninteractive-tabindex",
];
