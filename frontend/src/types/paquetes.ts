import type { Categoria } from './categorias'

export interface Paquete {
  id: number
  nombre: string
  // null en un paquete de precio abierto sin precio de referencia. En un
  // paquete por noche es la tarifa por noche por defecto.
  precio: string | null
  precio_abierto: boolean
  cobro_por_noche: boolean
  categoria_id: number
  duracion_dias: number
  duracion_unidad: 'dias' | 'meses'
  estado: 'activo' | 'inactivo'
  categorias: Categoria
}
