import { z } from 'zod'
import { FACTURAS_LABELS } from '@/constants/facturas.constants'

export const facturaSchema = z.object({
  cliente_id: z.coerce.number().min(1, `${FACTURAS_LABELS.cliente} es requerido`),
  paquete_id: z.coerce.number().min(1, `${FACTURAS_LABELS.paquete} es requerido`),
  fecha_facturacion: z.string().min(1, `${FACTURAS_LABELS.fechaFacturacion} es requerida`),
  fecha_proximo_pago: z.string().optional(),
  precio_base: z.coerce.number().positive(`${FACTURAS_LABELS.precioBase} debe ser mayor a 0`),
  // Solo se llenan en un paquete que se cobra por noche; el precio base sale de
  // multiplicarlas.
  noches: z.coerce.number().int().positive(`${FACTURAS_LABELS.noches} debe ser mayor a 0`).nullish(),
  precio_noche: z.coerce.number().positive(`${FACTURAS_LABELS.tarifaNoche} debe ser mayor a 0`).nullish(),
  descuento_monto: z.coerce.number().min(0),
  monto: z.coerce.number().positive(`${FACTURAS_LABELS.monto} debe ser mayor a 0`),
  origen: z.string().max(100).optional(),
  comision_tipo: z.enum(['porcentaje', 'monto']).default('porcentaje'),
  comision_valor: z.coerce.number().min(0, `${FACTURAS_LABELS.comision} no puede ser negativa`),
}).refine(
  (d) => d.comision_tipo !== 'porcentaje' || d.comision_valor <= 100,
  { path: ['comision_valor'], message: `${FACTURAS_LABELS.comision}: el porcentaje no puede superar 100` }
)

export type FacturaFormData = z.infer<typeof facturaSchema>
