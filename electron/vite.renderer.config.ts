import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  // https://github.com/vitejs/vite/issues/6156
  optimizeDeps: {
    exclude: ['lucide-svelte/icons/']
  },
});
