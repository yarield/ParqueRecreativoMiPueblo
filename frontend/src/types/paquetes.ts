import type { Categoria } from './categorias'

export interface Paquete {
  id: number
  nombre: string
  precio: string
  categoria_id: number
  duracion_dias: number
  estado: 'activo' | 'inactivo'
  categorias: Categoria
}
