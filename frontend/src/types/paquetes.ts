import type { Categoria } from './categorias'

export interface Paquete {
  id: number
  nombre: string
  // null en un paquete de precio abierto sin precio de referencia.
  precio: string | null
  precio_abierto: boolean
  categoria_id: number
  duracion_dias: number
  duracion_unidad: 'dias' | 'meses'
  estado: 'activo' | 'inactivo'
  categorias: Categoria
}
