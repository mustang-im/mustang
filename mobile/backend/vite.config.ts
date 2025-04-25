import { defineConfig } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      name: 'index',
      fileName: () => 'index.js',
      formats: ['cjs'],
      entry: './index.ts'
    },
    outDir: '../android/app/src/main/assets/public/nodejs',
    emptyOutDir: false,
    minify: false
  },
  plugins: [
    nodeExternals({
      deps: false,
      devDeps: true, // Use node.js internal modules
    })
  ],
});
