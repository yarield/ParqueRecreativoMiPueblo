import { API_BASE_URL } from '@/config/api.config'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    // El JWT ya no va en un header Authorization que arma este archivo: vive
    // en una cookie HttpOnly (ver PoC "JWT en localStorage"), y es el propio
    // navegador quien la adjunta. `credentials: 'include'` es necesario para
    // que la cookie viaje incluso si en algún entorno el front y el back no
    // comparten origen exacto (en dev/producción normalmente sí, vía proxy).
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
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
 * y no JSON, pero comparte la cookie de sesión y el manejo de sesión expirada.
 */
async function descargar(path: string): Promise<{ blob: Blob; nombreArchivo: string | null }> {
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' })

  if (res.status === 401) {
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
