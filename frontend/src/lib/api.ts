import { API_BASE_URL } from '@/config/api.config'

function getToken() {
  return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Error ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

/**
 * Descarga un archivo del API. No usa `request` porque la respuesta es binaria
 * y no JSON, pero comparte el token y el manejo de sesión expirada.
 */
async function descargar(path: string): Promise<{ blob: Blob; nombreArchivo: string | null }> {
  const token = getToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  if (!res.ok) {
    // Los errores sí vienen en JSON.
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Error ${res.status}`)
  }

  const disposition = res.headers.get('Content-Disposition')
  const nombreArchivo = disposition?.match(/filename="(.+?)"/)?.[1] ?? null

  return { blob: await res.blob(), nombreArchivo }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  descargar,
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
