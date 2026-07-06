import { z } from 'zod'
import { PAQUETES_LABELS } from '@/constants/paquetes.constants'

export const paqueteSchema = z.object({
  nombre: z.string().min(1, `${PAQUETES_LABELS.nombre} es requerido`),
  precio: z.coerce.number().positive(`${PAQUETES_LABELS.precio} debe ser mayor a 0`),
  categoria_id: z.coerce.number().min(1, `${PAQUETES_LABELS.categoria} es requerida`),
  duracion_dias: z.coerce.number().int().positive(`${PAQUETES_LABELS.duracion} debe ser mayor a 0`),
  duracion_unidad: z.enum(['dias', 'meses']).default('dias'),
  descuento_tipo: z.enum(['porcentaje', 'monto']).default('porcentaje'),
  descuento_valor: z.coerce.number().min(0, `${PAQUETES_LABELS.descuentoValor} no puede ser negativo`),
  estado: z.enum(['activo', 'inactivo']),
}).refine(
  (d) => d.descuento_tipo !== 'porcentaje' || d.descuento_valor <= 100,
  { path: ['descuento_valor'], message: `${PAQUETES_LABELS.descuentoValor}: el porcentaje no puede superar 100` }
)

export type PaqueteFormData = z.infer<typeof paqueteSchema>
