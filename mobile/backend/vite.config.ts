import { defineConfig } from 'vite';
import nodeExternals from 'rollup-plugin-node-externals';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import esmShim from '@rollup/plugin-esm-shim';

const projectDir = '../../dist/nodejs';
export default defineConfig(({}) => {
  const arch = process.env.MOBILE_ARCH;
  const isAndroid = arch?.startsWith('android');
  return {
    ssr: { noExternal: true },
    build: {
      target: 'node24',
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
          {
            src: 'dist/index.js',
            dest: projectDir,
            rename: 'index.mjs',
          },
          {
            src: 'package-deploy.json',
            dest: projectDir,
            rename: 'package.json',
          },
          {
            src: `node_modules/better-sqlite3${isAndroid ? `/prebuilds/${arch}/better_sqlite3.node` : ''}`,
            dest: `${projectDir}/${isAndroid ? 'build' : 'node_modules'}`,
          },
          {
            src: `node_modules/bufferutil${isAndroid ? `/prebuilds/${arch}/bufferutil.node` : ''}`,
            dest: `${projectDir}/${isAndroid ? `prebuilds/${arch}` : 'node_modules'}`,
          },
        ]
      }),
    ],
  }
});
