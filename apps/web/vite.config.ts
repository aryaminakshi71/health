import { defineConfig, loadEnv } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env from root (../../)
  const env = loadEnv(mode, path.resolve(__dirname, "../../"), "");
  process.env = { ...process.env, ...env };

  return {
    // Vite equivalent of Next.js transpilePackages for monorepo workspace packages
    optimizeDeps: {
      // Exclude workspace packages so they are compiled as source
      exclude: [
        '@healthcare/env',
        "@healthcare/api",
      ],
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      host: true,
      strictPort: false,
    },
    plugins: [
      viteTsConfigPaths(),
      ...(process.env.SKIP_CLOUDFLARE !== 'true' ? [
        cloudflare({
          viteEnvironment: { name: 'ssr' },
          persist: true,
        })
      ] : []),
      // devtools(), // Commented out devtools if package not installed
      tailwindcss(),
      tanstackStart({
        srcDirectory: "src",
        start: { entry: "./start.tsx" },
        server: { entry: "./server.ts" },
      }),
      viteReact(),
    ],
  };
})
