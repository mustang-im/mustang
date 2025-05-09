import { defineConfig } from 'vite';
import conditionalCompile from 'vite-plugin-conditional-compile';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { includeProprietary, production, webMail } from '../app/logic/build';

export default defineConfig({
  root: './src',
  publicDir: '../../app/public',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    sourcemap: production,
  },
});
