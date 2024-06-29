import { defineConfig } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { lingui } from '@lingui/vite-plugin';
import { olm } from './build/olm';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5454,
    strictPort: true,
  },
  plugins: [
    nodePolyfills({ include: ['buffer'], globals: { global: false, process: false } }),
    svelte(),
    olm,
    lingui(),
  ],
});
