import { defineConfig } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';

export default defineConfig({
  ssr: { noExternal: true },
  build: {
    target: 'node18',
    lib: {
      name: 'index',
      fileName: () => 'index.js',
      formats: ['es'],
      entry: './index.ts'
    },
    outDir: '../android/app/src/main/assets/public/nodejs',
    emptyOutDir: false,
    minify: false,
    ssr: true,
  },
  plugins: [
    nodeExternals({
      deps: false,
      devDeps: true, // Use node.js internal modules
    })
  ],
});
