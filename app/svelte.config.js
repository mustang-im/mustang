import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess({ script: true }),
  compilerOptions: {
    // Unlike `onwarn`, this is honored by the build, `svelte-check` and the VSCode extension alike
    warningFilter: warning => !ignoreSvelteCompilerWarnings.includes(warning.code),
  },
}

// Warnings that we get all over the codebase. Rare ones use `<!-- svelte-ignore -->` in the code.
const ignoreSvelteCompilerWarnings = [
  "a11y_no_static_element_interactions",
  "a11y_autofocus",
  "a11y_click_events_have_key_events",
  "a11y_no_noninteractive_tabindex",
  "element_invalid_self_closing_tag",
];
