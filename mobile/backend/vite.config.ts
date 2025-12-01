import { defineConfig } from 'vite';
import conditionalCompile from "vite-plugin-conditional-compile";
import nodeExternals from 'rollup-plugin-node-externals';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import esmShim from '@rollup/plugin-esm-shim';

const androidProject = '../../dist/nodejs';
const iosProject = '../../ios/App/App/nodejs-project';

export default defineConfig(({}) => {
  const arch = process.env.MOBILE_ARCH;
  const isIOS = arch?.startsWith('ios');
  const projectDir = isIOS ? iosProject : androidProject;
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
      rollupOptions: {
        output: {
          entryFileNames: 'index.mjs',
        },
      },
    },
    plugins: [
      conditionalCompile({
        env: {
          IOS: isIOS,
        }
      }),
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
            src: `node_modules/better-sqlite3/prebuilds/${arch}/better_sqlite3.node${isIOS ? '/better_sqlite3' : ''}`,
            dest: `${projectDir}/build${isIOS ? '/better_sqlite3.node' : ''}`,
            rename: isIOS ? 'better_sqlite3' : undefined,
          },
          {
            src: `node_modules/bufferutil/prebuilds/${arch}/bufferutil.node${isIOS ? '/bufferutil' : ''}`,
            dest: `${projectDir}/prebuilds/${arch}${isIOS ? '/bufferutil.node' : ''}`,
            rename: isIOS ? 'bufferutil' : undefined,
          },
        ]
      }),
    ],
  }
});
