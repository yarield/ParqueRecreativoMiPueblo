import { z } from 'zod'
import { PAQUETES_LABELS } from '@/constants/paquetes.constants'

export const paqueteSchema = z.object({
  nombre: z.string().min(1, `${PAQUETES_LABELS.nombre} es requerido`),
  precio: z.coerce.number().positive(`${PAQUETES_LABELS.precio} debe ser mayor a 0`),
  categoria_id: z.coerce.number().min(1, `${PAQUETES_LABELS.categoria} es requerida`),
  duracion_dias: z.coerce.number().int().positive(`${PAQUETES_LABELS.duracion} debe ser mayor a 0`),
  estado: z.enum(['activo', 'inactivo']),
})

export type PaqueteFormData = z.infer<typeof paqueteSchema>
