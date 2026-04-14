import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['sqlite-vec', 'sqlite-vec-linux-x64'],
      output: {
        preserveModules: true
      }
    }
  }
})
