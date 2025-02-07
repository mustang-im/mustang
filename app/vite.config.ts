import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { lingui } from '@lingui/vite-plugin';
import conditionalCompile from "vite-plugin-conditional-compile";
import { olm } from './build/olm';
import { isWebMail } from './logic/build';

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
        // For conditional `// #if FOO` statements in the code
        WEBMAIL: isWebMail ? true : undefined,
      },
    }),
    nodePolyfills({ include: ['buffer'], globals: { global: false, process: isWebMail } }),
    svelte(),
    olm,
    lingui(),
    sentryVitePlugin({
      org: "mustang-jq",
      project: "mustang"
    })
  ],

  build: {
    sourcemap: true
  },
  base: './',
});
