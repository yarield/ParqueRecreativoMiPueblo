import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthContextType, Usuario, MeResponse } from '@/types/auth'
import { api } from '@/lib/api'
import { API_BASE_URL } from '@/config/api.config'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Arranca en true: no hay token en localStorage que leer de forma
  // síncrona (vive en una cookie HttpOnly), así que hasta que GET
  // /api/auth/me responda no sabemos si hay sesión o no. Ver ProtectedRoute,
  // que espera a que esto baje a false antes de decidir si redirige.
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Fetch directo, sin pasar por api.ts: un visitante sin sesión que
    // carga cualquier página SIEMPRE va a recibir 401 aquí, y eso es
    // normal, no un "se venció la sesión" — api.ts, en cambio, trata todo
    // 401 como sesión expirada y fuerza una redirección a /login, que acá
    // sería incorrecta (y en /login mismo, un bucle).
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? (res.json() as Promise<MeResponse>) : null))
      .then((data) => setUsuario(data?.usuario ?? null))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [])

  function login(usuario: Usuario) {
    // El token ya quedó puesto por el navegador como cookie HttpOnly (el
    // backend lo manda en el header Set-Cookie de la respuesta de login) —
    // aquí no hay nada que guardar en localStorage, solo el estado de UI.
    setUsuario(usuario)
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {})
    } finally {
      setUsuario(null)
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, isAuthenticated: !!usuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
