import { z } from 'zod'
import { CLIENTES_LABELS } from '@/constants/clientes.constants'

export const clienteSchema = z.object({
  nombre: z.string().min(1, `${CLIENTES_LABELS.nombre} es requerido`),
  // Opcional: los menores de edad se registran sin cédula y se completa después.
  cedula: z.string().optional(),
  telefono: z.string().optional(),
  fecha_inicio: z.string().min(1, `${CLIENTES_LABELS.fechaInicio} es requerida`),
  observaciones: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
