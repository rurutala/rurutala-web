import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { recommendedEditor } from './plugins/recommended-editor.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    recommendedEditor(),
    ViteImageOptimizer({
      includePublic: true,
      test: /\.(jpe?g|png|gif|tiff|webp|avif)$/i,
      png: {
        quality: 80,
      },
      webp: {
        quality: 82,
      },
    }),
  ],
})
