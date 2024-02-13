import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ["jpc-core", "jpc-ws"] }),
      viteStaticCopy({
        targets: [
          {
            src: '../lib/logic/storage/mail-sql/',
            dest: '.'
          },
          {
            src: '../lib/locale/',
            dest: '.'
          }
        ]
      }),
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [svelte()]
  }
})
