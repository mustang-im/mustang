import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import esmShim from '@rollup/plugin-esm-shim';
import { copyExternals } from './vite-plugin-copy-externals';
import { resolve } from 'path';

const nodeNativeModules = ['better-sqlite3', 'bufferutil'];

const projectDir = resolve(__dirname, '../dist/nodejs');

export default defineConfig(({}) => {
  const arch = process.env.MOBILE_ARCH;
  const isAndroid = arch?.startsWith('android');

  // Conditional plugin arrays
  const staticCopyTargets = [
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
  ];

  if (isAndroid) {
    staticCopyTargets.push(
      {
        src: `node_modules/better-sqlite3/prebuilds/${arch}/better_sqlite3.node`,
        dest: `${projectDir}/build`,
      },
      {
        src: `node_modules/bufferutil/prebuilds/${arch}/bufferutil.node`,
        dest: `${projectDir}/prebuilds/${arch}`,
      }
    );
  }

  return {
    ssr: {
      noExternal: createNegationRegex(nodeNativeModules),
    },
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
    },
    plugins: [
      esmShim(),
      viteStaticCopy({
        targets: staticCopyTargets,
      }),
      // Only run copyExternals for non-Android
      !isAndroid &&
        copyExternals({
          deps: nodeNativeModules,
          outDir: `${projectDir}/node_modules`,
          lockFile: 'yarn',
        }),
    ].filter(Boolean), // remove false entries
  }
});

function createNegationRegex(arr: string[]) {
  const escaped = arr.map((s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = escaped.join('|');
  return new RegExp(`^(?!.*(?:${pattern})).*$`);
}
