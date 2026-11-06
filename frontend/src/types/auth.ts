export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
}

export interface AuthContextType {
  usuario: Usuario | null
  // Mientras se resuelve el GET /api/auth/me inicial (ver AuthContext): ya
  // no hay token en localStorage que permita saber esto de forma síncrona,
  // porque el JWT vive en una cookie HttpOnly que JavaScript no puede leer.
  cargando: boolean
  login: (usuario: Usuario) => void
  logout: () => void
  isAuthenticated: boolean
}

// Ya no incluye "token": el backend lo entrega en una cookie HttpOnly, no
// en el cuerpo de la respuesta (ver PoC "JWT en localStorage").
export interface LoginResponse {
  usuario: Usuario
}

export interface MeResponse {
  usuario: Usuario
}

export interface RegisterResponse {
  id: number
  nombre: string
  email: string
  rol: string
}
