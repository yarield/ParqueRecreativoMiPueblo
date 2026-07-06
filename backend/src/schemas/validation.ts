import { z } from 'zod'

// Máximo representable en Decimal(10,2)
const DEC_MAX = 99_999_999.99

// Fecha en formato ISO/'YYYY-MM-DD' válida.
const fechaISO = z
  .string()
  .refine((s) => /^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(Date.parse(s)), 'Fecha inválida')

// ---------- Categorías ----------
export const categoriaCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100),
  descripcion: z.string().max(1000).nullish(),
})
export const categoriaUpdateSchema = categoriaCreateSchema.partial()

// ---------- Clientes ----------
export const clienteCreateSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(150),
  cedula: z.string().trim().min(1, 'La cédula es requerida').max(30),
  telefono: z.string().max(30).nullish(),
  fecha_inicio: fechaISO,
  observaciones: z.string().max(2000).nullish(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
})
export const clienteUpdateSchema = clienteCreateSchema.partial()

// ---------- Paquetes ----------
const paqueteBase = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(150),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0').max(DEC_MAX),
  categoria_id: z.coerce.number().int().positive('La categoría es requerida'),
  duracion_dias: z.coerce.number().int().positive('La duración debe ser mayor a 0'),
  duracion_unidad: z.enum(['dias', 'meses']).default('dias'),
  descuento_tipo: z.enum(['porcentaje', 'monto']).default('porcentaje'),
  descuento_valor: z.coerce.number().min(0, 'La deducción no puede ser negativa').max(DEC_MAX).default(0),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
})
const topePorcentaje = (d: { descuento_tipo?: string; descuento_valor?: number }) =>
  d.descuento_tipo !== 'porcentaje' || (d.descuento_valor ?? 0) <= 100
const msgPorcentaje = { path: ['descuento_valor'], message: 'El porcentaje no puede superar 100' }

export const paqueteCreateSchema = paqueteBase.refine(topePorcentaje, msgPorcentaje)
export const paqueteUpdateSchema = paqueteBase.partial().refine(topePorcentaje, msgPorcentaje)

// ---------- Facturas ----------
// precio_base y monto NO se aceptan del cliente: se recalculan en el servidor
// desde el paquete. Solo se toma el descuento (que además se clampa).
export const facturaSchema = z
  .object({
    cliente_id: z.coerce.number().int().positive('El cliente es requerido'),
    paquete_id: z.coerce.number().int().positive('El paquete es requerido'),
    fecha_facturacion: fechaISO.optional(),
    fecha_proximo_pago: fechaISO,
    descuento_monto: z.coerce.number().min(0, 'El descuento no puede ser negativo').max(DEC_MAX).default(0),
  })
  .refine(
    (d) => !d.fecha_facturacion || Date.parse(d.fecha_proximo_pago) >= Date.parse(d.fecha_facturacion),
    { path: ['fecha_proximo_pago'], message: 'El próximo pago no puede ser anterior a la facturación' }
  )
