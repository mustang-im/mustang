import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess({ script: true }),
  // <https://github.com/sveltejs/language-tools/issues/650#issuecomment-1181354795>
  onwarn: (warning, handler) => {
    if (ignoreSvelteCompilerWarnings.includes(warning.code)) {
      return;
    }
    handler(warning);
  },
  compilerOptions: {
    runes: false,
  },
}

const ignoreSvelteCompilerWarnings = [
  "a11y-autofocus",
  "a11y-mouse-events-have-key-events",
  "a11y-click-events-have-key-events",
  "a11y-no-noninteractive-tabindex",
  "element_invalid_self_closing_tag",
];
