import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import esmShim from '@rollup/plugin-esm-shim';

const nodeNativeModules = ['better-sqlite3', 'ws'];

const projectDir = '../../dist/nodejs';
export default defineConfig(({}) => {
  const arch = process.env.MOBILE_ARCH;
  const isAndroid = arch?.startsWith('android');
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

function createNegationRegex(arr: string[]) {
  // Escape special regex characters in each string for safe regex usage
  const escaped = arr.map((s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  // Join array into alternation group
  const pattern = escaped.join('|');

  // Negative lookahead to negate the entire pattern anywhere in the string
  // This pattern matches strings that do NOT contain any of the array strings
  return new RegExp(`^(?!.*(?:${pattern})).*$`);
}
