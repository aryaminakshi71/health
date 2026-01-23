/**
 * TanStack Start App Configuration
 */

import { defineConfig } from '@tanstack/start/config';
import { vitePlugin } from '@tanstack/start/vite-plugin';

export default defineConfig({
  vite: {
    plugins: [vitePlugin()],
  },
  server: {
    port: 3000,
  },
});
