import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import wasm from 'vite-plugin-wasm';
import conditionalCompile from "vite-plugin-conditional-compile";
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
        // Workaround for disabling broken features for iOS
        IOS: process.env.MOBILE_ARCH?.startsWith("ios"),
      },
    }),
    nodePolyfills({ include: ['buffer'], globals: { global: true, process: !!webMail } }),
    svelte(),
    wasm(),
    sentryVitePlugin({
      org: "mustang-jq",
      project: "mustang"
    })
  ],
  optimizeDeps: {
    exclude: ['@matrix-org/matrix-sdk-crypto-wasm'],
  },
  build: {
    sourcemap: true
  },
  base: './',
});
