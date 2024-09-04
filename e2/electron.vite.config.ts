import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import esmShim from 'esm-shim-plugin';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ["@radically-straightforward/sqlite"] }),
      esmShim(),
    ],
    build: {
      rollupOptions: {
        output: {
          format: 'es'
        },
      },
    },
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
      esmShim(),
    ],
    build: {
      rollupOptions: {
        output: {
          format: 'es'
        },
      },
    },
  },
  renderer: {
    plugins: [nodePolyfills({include: ['buffer'], globals: {global: false, process: false}}), svelte()]
  }
})
