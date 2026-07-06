import type { Categoria } from './categorias'

export interface Paquete {
  id: number
  nombre: string
  precio: string
  categoria_id: number
  duracion_dias: number
  duracion_unidad: 'dias' | 'meses'
  descuento_tipo: 'porcentaje' | 'monto'
  descuento_valor: string
  estado: 'activo' | 'inactivo'
  categorias: Categoria
}
