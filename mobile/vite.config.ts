import { defineConfig } from 'vite';
import conditionalCompile from 'vite-plugin-conditional-compile';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { includeProprietary, production, webMail } from '../app/logic/build';

export default defineConfig({
  root: './src',
  publicDir: '../app/public',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    sourcemap: production,
  },
  plugins: [
    conditionalCompile({
      // <https://github.com/LZS911/vite-plugin-conditional-compile/blob/master/README.md>
      env: {
        // For conditional `// #if [FOO]` statements in the code
        WEBMAIL: webMail && includeProprietary ? webMail : undefined,
        PROPRIETARY: includeProprietary ? true : undefined,
      },
    }),
    nodePolyfills({include: ['buffer'], globals: {global: false, process: false}}),
    svelte({configFile: '../svelte.config.mjs'}),
    sentryVitePlugin({
      org: "mustang-jq",
      project: "mustang",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !production,
    }),
  ],
});
