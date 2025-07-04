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
    },
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
        // Android bundle
        {
          src: 'dist/index.js',
          dest: '../../dist/nodejs',
          rename: 'index.mjs',
        },
        {
          src: 'package-deploy.json',
          dest: '../../dist/nodejs',
          rename: 'package.json',
        },
        {
          src: `node_modules/better-sqlite3/prebuilds/${process.env.MOBILE_ARCH}/better_sqlite3.node`,
          dest: '../../dist/nodejs/build',
        },
        {
          src: `node_modules/bufferutil/prebuilds/${process.env.MOBILE_ARCH}/bufferutil.node`,
          dest: `../../dist/nodejs/prebuilds/${process.env.MOBILE_ARCH}`,
        },

        // iOS bundle
        {
          src: 'dist/index.js',
          dest: '../../ios/App/App/nodejs-project',
          rename: 'index.mjs',
        },
        {
          src: 'package-deploy.json',
          dest: '../../ios/App/App/nodejs-project',
          rename: 'package.json',
        },
        {
          src: `node_modules/better-sqlite3/prebuilds/${process.env.MOBILE_ARCH}/better_sqlite3.node`,
          dest: '../../ios/App/App/nodejs-project/build',
        },
        {
          src: `node_modules/bufferutil/prebuilds/${process.env.MOBILE_ARCH}/bufferutil.node`,
          dest: '../../ios/App/App/nodejs-project/build',
        },
      ]
    }),
  ],
});
