import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import replace from '@rollup/plugin-replace';
import conditionalCompile from "vite-plugin-conditional-compile";
import { production, webMail, includeProprietary } from '../app/logic/build';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ["@radically-straightforward/sqlite"] }),
      replace({
        __dirname: 'import.meta.dirname',
      }),
    ],
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
    ],
  },
  renderer: {
    build: {
      sourcemap: production,
    },
    plugins: [
      conditionalCompile({
        // <https://github.com/LZS911/vite-plugin-conditional-compile/blob/master/README.md>
        env: {
          // For conditional `// #if [FOO]` statements in the code
          WEBMAIL: webMail && includeProprietary ? webMail : undefined,
          PROPRIETARY: includeProprietary ? true : undefined,
          PRODUCTION: production ? true : undefined,
          DEV: !production ? true : undefined,
        },
      }),
      nodePolyfills({include: ['buffer'], globals: {global: false, process: false}}),
      svelte(),
      sentryVitePlugin({
        org: "mustang-jq",
        project: "mustang",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        disable: !production,
      }),
    ],
    publicDir: '../../../app/public',
  }
})
