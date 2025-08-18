import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  publicDir: './njs',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
});
