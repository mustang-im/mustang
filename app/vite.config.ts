import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { olm } from './build/olm';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5454,
    strictPort: true,
    // https://vitejs.dev/config/server-options.html#server-proxy
    proxy: {
      '/meet/auth/': {
        target: 'https://accounts.mustang.im/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/meet\//, ''),
      },
      '/meet/controller/': {
        target: 'https://controller.mustang.im',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/meet\/controller/, ''),
      },
      /*'/meet/signaling': {
        target: 'wss://controller.mustang.im',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/meet\//, ''),
      },*/
      '/ispdb/': {
        target: 'https://v1.ispdb.net/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ispdb/, ''),
      },
      '/mx/': {
        target: 'https://mx.thunderbird.net/dns/mx/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mx/, ''),
      },
    },
  },
  plugins: [svelte(), olm],
});
