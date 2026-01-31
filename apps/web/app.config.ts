/**
 * TanStack Start App Configuration
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@tanstack/start/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(rootDir, 'src');

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
  },
  server: {
    port: 3000,
  },
});
