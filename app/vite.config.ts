import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig, defaultClientConditions } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import conditionalCompile from "vite-plugin-conditional-compile";
//import { olm } from './build/olm';
import { webMail, isMobile, includeProprietary } from './logic/build';

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
    sentryVitePlugin({
      org: "mustang-jq",
      project: "mustang"
    })
  ],

  resolve: {
    // Explicitly set the resolve conditions for Vite 7+
    conditions: defaultClientConditions,
  },

  build: {
    sourcemap: true
  },
  base: './',
});
