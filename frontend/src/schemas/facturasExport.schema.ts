import { z } from 'zod'
import { EXPORTAR_MESSAGES } from '@/constants/exportar.constants'

export const facturaExportSchema = z
  .object({
    modo: z.enum(['rango', 'mes', 'total']),
    desde: z.string().optional(),
    hasta: z.string().optional(),
    mes: z.string().optional(),
  })
  // Cada modo solo exige sus propios campos: los demás se ignoran.
  .refine((d) => d.modo !== 'rango' || (!!d.desde && !!d.hasta), {
    path: ['desde'],
    message: EXPORTAR_MESSAGES.rangoRequerido,
  })
  .refine((d) => d.modo !== 'rango' || !d.desde || !d.hasta || d.hasta >= d.desde, {
    path: ['hasta'],
    message: EXPORTAR_MESSAGES.rangoInvertido,
  })
  .refine((d) => d.modo !== 'mes' || !!d.mes, {
    path: ['mes'],
    message: EXPORTAR_MESSAGES.mesRequerido,
  })

export type FacturaExportFormData = z.infer<typeof facturaExportSchema>
