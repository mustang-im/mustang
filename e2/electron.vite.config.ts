import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ["@radically-straightforward/sqlite"] }),
      replace({
        __dirname: 'import.meta.dirname',
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
    },
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
    },
  },
  renderer: {
    plugins: [nodePolyfills({include: ['buffer'], globals: {global: false, process: false}}), svelte()]
  }
})
