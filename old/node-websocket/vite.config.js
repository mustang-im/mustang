import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      "mustang-lib": path.resolve("../lib/")
    },
  },
});
