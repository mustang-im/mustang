import { defineConfig } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import conditionalCompile from "vite-plugin-conditional-compile";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { viteLazyImport } from '@phantasm0009/lazy-import/bundler';
//import { olm } from './build/olm';
import { webMail, isMobile, includeProprietary } from './logic/build';

import { analyzer } from 'vite-bundle-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5454,
    strictPort: true,
  },

  plugins: [
    conditionalCompile({
      // <https://github.com/LZS911/vite-plugin-conditional-compile/blob/master/README.md>
      env: {
        // For conditional `// #if [FOO]` statements in the code
        WEBMAIL: !!webMail && includeProprietary ? !!webMail : undefined,
        MOBILE: isMobile,
        PROPRIETARY: includeProprietary ? true : undefined,
      },
    }),
    nodePolyfills({ include: ['buffer'], globals: { global: true, process: !!webMail } }),
    svelte(),
    // olm,
    wasm(),
    topLevelAwait(),
    ViteImageOptimizer(),
    viteLazyImport(),
    analyzer(),
  ],

  build: {
    sourcemap: false,
    minify: false,
    chunkSizeWarningLimit: 300,
  },
  base: './',
});
