import { defineConfig } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import esmShim from '@rollup/plugin-esm-shim';

export default defineConfig({
  ssr: { noExternal: true },
  build: {
    target: 'node18',
    lib: {
      name: 'index',
      formats: ['es'],
      entry: './index.ts'
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    ssr: true,
    commonjsOptions: {
      // To load better-sqlite3
      ignoreDynamicRequires: true,
    }
  },
  plugins: [
    nodeExternals({
      deps: false,
      devDeps: true, // Use node.js internal modules
    }),
    // Required for proper error messages
    esmShim(),
    viteStaticCopy({
      targets: [
        {
          src: 'dist/index.js',
          dest: '../../../app/dist/nodejs',
          rename: 'index.mjs',
        },
        {
          src: 'package-deploy.json',
          dest: '../../../app/dist/nodejs',
          rename: 'package.json',
        },
        {
          src: '../../backend/node_modules/better-sqlite3/prebuilds/android-arm64/better_sqlite3.node',
          dest: '../../../app/dist/nodejs/build'
        }
      ]
    }),
  ],
});
