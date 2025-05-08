import { defineConfig } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
  },
  plugins: [
    nodeExternals({
      deps: false,
      devDeps: true, // Use node.js internal modules
    }),
    viteStaticCopy({
      targets: [
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
      ]
    }),
  ],
});
