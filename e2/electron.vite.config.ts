import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import replace from '@rollup/plugin-replace';
import { production } from '../app/logic/build';

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
      nodePolyfills({include: ['buffer'], globals: {global: false, process: false}}),
      svelte(),
      sentryVitePlugin({
        org: "mustang-jq",
        project: "mustang",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        disable: !production,
      }),
    ],
  }
})
