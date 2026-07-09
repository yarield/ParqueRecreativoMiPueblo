import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // En desarrollo, redirige /api al backend para usar la misma ruta relativa
  // que en producción (detrás de Nginx/Cloudflare).
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
