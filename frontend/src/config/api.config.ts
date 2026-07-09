// En producción se sirve detrás de Nginx/Cloudflare como ruta relativa (/api).
// En desarrollo, Vite hace proxy de /api al backend (ver vite.config.ts).
// Se puede sobreescribir con VITE_API_URL si hace falta.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
