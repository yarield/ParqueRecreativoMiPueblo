import { z } from 'zod'
import { CATEGORIAS_LABELS } from '@/constants/categorias.constants'

export const categoriaSchema = z.object({
  nombre: z.string().min(1, `${CATEGORIAS_LABELS.nombre} es requerido`),
  descripcion: z.string().optional(),
})

export type CategoriaFormData = z.infer<typeof categoriaSchema>
