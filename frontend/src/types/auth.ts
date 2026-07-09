export interface Usuario {
  id: number
  nombre: string
  email: string
}

export interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAuthenticated: boolean
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface RegisterResponse {
  id: number
  nombre: string
  email: string
}
