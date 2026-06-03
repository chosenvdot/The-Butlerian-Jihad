import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// Static SPA build → emits to dist/ for Cloudflare Pages.
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})