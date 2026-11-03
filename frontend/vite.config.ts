import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Prohíbe que otro sitio cargue la app dentro de un <iframe> (clickjacking).
// X-Frame-Options es la cabecera clásica y frame-ancestors la de CSP; se mandan
// las dos porque hay navegadores que solo respetan una. En producción las pone
// Nginx (ver DEPLOY.md); esto cubre el servidor de desarrollo y `vite preview`.
const CABECERAS_ANTI_FRAMING = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
}

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
    headers: CABECERAS_ANTI_FRAMING,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  preview: {
    headers: CABECERAS_ANTI_FRAMING,
  },
})
