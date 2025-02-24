import { defineConfig } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { svelte } from './extractor/vite-plugin-svelte/src/index';
import { jsTsExtractor } from "./extractor/tsExtractor-plugin";
import { extractStrings } from "./extractor/extractor-plugin";
import conditionalCompile from "vite-plugin-conditional-compile";
import { webMail, includeProprietary } from '../logic/build';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    conditionalCompile({
      // <https://github.com/LZS911/vite-plugin-conditional-compile/blob/master/README.md>
      env: {
        // For conditional `// #if [FOO]` statements in the code
        WEBMAIL: webMail && includeProprietary ? webMail : undefined,
        PROPRIETARY: includeProprietary ? true : undefined,
      },
    }),
    nodePolyfills({ include: ['buffer'], globals: { global: false, process: webMail } }),
    svelte(),
    jsTsExtractor(),
    extractStrings(),
  ],
});
