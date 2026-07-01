export interface Cliente {
  id: number
  nombre: string
  cedula: string
  telefono: string | null
  fecha_inicio: string
  observaciones: string | null
  estado: 'activo' | 'inactivo'
}
