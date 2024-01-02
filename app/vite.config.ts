import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5454,
    strictPort: true,
    // https://vitejs.dev/config/server-options.html#server-proxy
    proxy: {
      '/conf/controller/': {
        target: 'https://controller.mustang.im',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/conf\/controller/, ''),
      },
      '/conf/signaling': {
        target: 'wss://controller.mustang.im',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/conf\//, ''),
      },
    },
  },
  plugins: [svelte()],
})
