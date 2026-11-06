import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, cargando } = useAuth()
  // Mientras se resuelve el GET /api/auth/me inicial no se sabe todavía si
  // hay sesión (la cookie HttpOnly no se puede leer desde aquí) — redirigir
  // antes de tiempo mandaría a /login a alguien que sí tiene sesión válida.
  if (cargando) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
