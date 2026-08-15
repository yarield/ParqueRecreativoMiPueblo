import { z } from 'zod'
import { PAQUETES_LABELS, PAQUETES_MESSAGES } from '@/constants/paquetes.constants'

export const paqueteSchema = z.object({
  nombre: z.string().min(1, `${PAQUETES_LABELS.nombre} es requerido`),
  // En modo abierto y por noche el precio puede quedar vacío; en modo fijo es
  // obligatorio (se valida más abajo, donde ya se conoce el modo).
  precio: z.coerce.number().positive(`${PAQUETES_LABELS.precio} debe ser mayor a 0`).nullable(),
  precio_abierto: z.boolean().default(false),
  cobro_por_noche: z.boolean().default(false),
  categoria_id: z.coerce.number().min(1, `${PAQUETES_LABELS.categoria} es requerida`),
  duracion_dias: z.coerce.number().int().positive(`${PAQUETES_LABELS.duracion} debe ser mayor a 0`),
  duracion_unidad: z.enum(['dias', 'meses']).default('dias'),
  estado: z.enum(['activo', 'inactivo']),
}).refine(
  (d) => d.precio_abierto || d.cobro_por_noche || d.precio != null,
  { path: ['precio'], message: PAQUETES_MESSAGES.precioRequerido }
)

export type PaqueteFormData = z.infer<typeof paqueteSchema>
