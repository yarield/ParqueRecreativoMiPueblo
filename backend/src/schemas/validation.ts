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
  // En un paquete de precio abierto el precio es opcional: si viene, sirve de
  // referencia para prellenar la factura; si no, se escribe desde cero.
  precio: z.coerce.number().positive('El precio debe ser mayor a 0').max(DEC_MAX).nullish(),
  precio_abierto: z.boolean().default(false),
  categoria_id: z.coerce.number().int().positive('La categoría es requerida'),
  duracion_dias: z.coerce.number().int().positive('La duración debe ser mayor a 0'),
  duracion_unidad: z.enum(['dias', 'meses']).default('dias'),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
})

// Un paquete de precio fijo obliga a tener precio. En un update parcial que no
// toque el modo no hay nada que validar aquí.
const precioSegunModo = (d: { precio_abierto?: boolean; precio?: number | null }) =>
  d.precio_abierto !== false || d.precio != null
const msgPrecio = { path: ['precio'], message: 'El precio es requerido en un paquete de precio fijo' }

export const paqueteCreateSchema = paqueteBase.refine(precioSegunModo, msgPrecio)
export const paqueteUpdateSchema = paqueteBase.partial().refine(precioSegunModo, msgPrecio)

// ---------- Facturas ----------
// monto, comision_monto y monto_neto NO se aceptan del cliente: se recalculan
// en el servidor. precio_base solo se toma en cuenta si el paquete es de precio
// abierto; en un paquete de precio fijo la ruta lo descarta y usa el del
// paquete. El descuento y la comisión se clampan al recalcular.
export const facturaSchema = z
  .object({
    cliente_id: z.coerce.number().int().positive('El cliente es requerido'),
    paquete_id: z.coerce.number().int().positive('El paquete es requerido'),
    fecha_facturacion: fechaISO.optional(),
    // Opcional: en un paquete de precio abierto el cobro es único y la ruta la
    // fuerza a null. La ruta también la exige cuando el paquete sí tiene ciclo.
    fecha_proximo_pago: fechaISO.nullish(),
    precio_base: z.coerce.number().min(0, 'El precio no puede ser negativo').max(DEC_MAX).optional(),
    descuento_monto: z.coerce.number().min(0, 'El descuento no puede ser negativo').max(DEC_MAX).default(0),
    origen: z.string().trim().max(100).nullish(),
    comision_tipo: z.enum(['porcentaje', 'monto']).default('porcentaje'),
    comision_valor: z.coerce.number().min(0, 'La comisión no puede ser negativa').max(DEC_MAX).default(0),
  })
  .refine(
    (d) =>
      !d.fecha_facturacion ||
      !d.fecha_proximo_pago ||
      Date.parse(d.fecha_proximo_pago) >= Date.parse(d.fecha_facturacion),
    { path: ['fecha_proximo_pago'], message: 'El próximo pago no puede ser anterior a la facturación' }
  )
  .refine((d) => d.comision_tipo !== 'porcentaje' || d.comision_valor <= 100, {
    path: ['comision_valor'],
    message: 'El porcentaje de comisión no puede superar 100',
  })
