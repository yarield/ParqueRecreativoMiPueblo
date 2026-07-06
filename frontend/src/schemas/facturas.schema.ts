import { z } from 'zod'
import { FACTURAS_LABELS } from '@/constants/facturas.constants'

export const facturaSchema = z.object({
  cliente_id: z.coerce.number().min(1, `${FACTURAS_LABELS.cliente} es requerido`),
  paquete_id: z.coerce.number().min(1, `${FACTURAS_LABELS.paquete} es requerido`),
  fecha_facturacion: z.string().min(1, `${FACTURAS_LABELS.fechaFacturacion} es requerida`),
  fecha_proximo_pago: z.string().min(1, `${FACTURAS_LABELS.fechaProximoPago} es requerida`),
  precio_base: z.coerce.number().min(0),
  descuento_monto: z.coerce.number().min(0),
  monto: z.coerce.number().positive(`${FACTURAS_LABELS.monto} debe ser mayor a 0`),
})

export type FacturaFormData = z.infer<typeof facturaSchema>
