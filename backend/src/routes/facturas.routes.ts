import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { AuthRequest } from '../middlewares/auth'
import { validate, validateQuery, QueryRequest } from '../middlewares/validate'
import { facturaSchema, facturaExportQuerySchema, FacturaExportQuery } from '../schemas/validation'
import { resolverPeriodo } from '../lib/periodo'
import { generarExcelFacturas } from '../services/facturasExcel'

const router = Router()

const redondear = (n: number) => Number(n.toFixed(2))

// Resuelve a monto absoluto un valor expresado como porcentaje o como monto
// fijo, acotado al rango [0, base].
function resolverMonto(base: number, tipo: string, valor: number) {
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(valor) || valor <= 0) return 0
  const monto = tipo === 'porcentaje' ? base * (valor / 100) : valor
  return Math.min(base, Math.max(0, monto))
}

type PaquetePrecio = { precio: unknown; precio_abierto: boolean; cobro_por_noche: boolean }
type FacturaBody = {
  precio_base?: number
  noches?: number | null
  precio_noche?: number | null
  descuento_monto?: number
  comision_tipo?: string
  comision_valor?: number
}

// Precio base según el modo del paquete:
// - por noche: tarifa × noches, ambas tomadas de la factura (la tarifa del
//   paquete solo es el valor por defecto). Se devuelven para guardarlas, así el
//   histórico no depende de la tarifa que tenga el paquete hoy.
// - precio abierto: el precio que venga en el body.
// - precio fijo: el del paquete, descartando lo que haya llegado.
function resolverBase(paquete: PaquetePrecio, body: FacturaBody) {
  if (!paquete.cobro_por_noche) {
    const precio_base = paquete.precio_abierto
      ? Number(body.precio_base ?? NaN)
      : Number(paquete.precio ?? NaN)
    return { precio_base, noches: null, precio_noche: null }
  }

  const sinDatos = { precio_base: NaN, noches: null, precio_noche: null }
  const precio_noche = Number(body.precio_noche ?? paquete.precio ?? NaN)
  const noches = Number(body.noches ?? NaN)
  if (!Number.isInteger(noches) || noches <= 0) return sinDatos
  if (!Number.isFinite(precio_noche) || precio_noche <= 0) return sinDatos

  return {
    precio_base: redondear(precio_noche * noches),
    noches,
    precio_noche: redondear(precio_noche),
  }
}

// Recalcula todos los importes en el servidor en vez de confiar en lo que envía
// el cliente. Devuelve null si el precio resultante no es válido.
function calcularImporte(paquete: PaquetePrecio, body: FacturaBody) {
  const { precio_base, noches, precio_noche } = resolverBase(paquete, body)
  if (!Number.isFinite(precio_base) || precio_base <= 0) return null

  const descuento_monto = Math.min(precio_base, Math.max(0, body.descuento_monto ?? 0))
  const monto = redondear(precio_base - descuento_monto)

  // La comisión del canal se calcula sobre lo que efectivamente paga el cliente
  // y no reduce ese monto: solo reduce el neto que le queda al negocio.
  const comision_tipo = body.comision_tipo === 'monto' ? 'monto' : 'porcentaje'
  const comision_valor = Math.max(0, body.comision_valor ?? 0)
  const comision_monto = redondear(resolverMonto(monto, comision_tipo, comision_valor))

  return {
    precio_base: redondear(precio_base),
    noches,
    precio_noche,
    descuento_monto: redondear(descuento_monto),
    monto,
    comision_tipo,
    comision_valor: redondear(comision_valor),
    comision_monto,
    monto_neto: redondear(monto - comision_monto),
  }
}

const ERROR_PRECIO_ABIERTO = 'El paquete es de precio abierto: indique el precio de la factura'
const ERROR_POR_NOCHE = 'El paquete se cobra por noche: indique la tarifa por noche y la cantidad de noches'
const ERROR_PROXIMO_PAGO = 'La fecha de próximo pago es requerida'

// El error depende del dato que falta según el modo del paquete.
const errorImporte = (paquete: PaquetePrecio) =>
  paquete.cobro_por_noche ? ERROR_POR_NOCHE : ERROR_PRECIO_ABIERTO

// Tanto el precio abierto como el cobro por noche son cobros de una sola vez:
// una estadía no renueva sola.
const esPagoUnico = (paquete: PaquetePrecio) => paquete.precio_abierto || paquete.cobro_por_noche

// Un paquete de pago único no tiene próximo pago, y se descarta la fecha que
// haya mandado el cliente. En el resto es obligatoria.
function resolverProximoPago(pagoUnico: boolean, fecha?: string | null) {
  if (pagoUnico) return { ok: true as const, valor: null }
  if (!fecha) return { ok: false as const, valor: null }
  return { ok: true as const, valor: new Date(fecha) }
}

// GET /api/facturas — protegido
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const facturas = await prisma.facturas.findMany({
      include: { clientes: true, paquetes: { include: { categorias: true } }, usuarios: true },
      orderBy: { fecha_facturacion: 'desc' }
    })
    res.json(facturas)
  } catch (err) {
    next(err)
  }
})

// GET /api/facturas/exportar — protegido. Va antes que '/:id' porque si no esa
// ruta capturaría "exportar" como si fuera un id.
router.get(
  '/exportar',
  authMiddleware,
  validateQuery(facturaExportQuerySchema),
  async (req: QueryRequest<FacturaExportQuery>, res, next) => {
    try {
      const { modo, desde, hasta, mes } = req.datosQuery!
      const periodo = resolverPeriodo(modo, desde, hasta, mes)

      // El reporte sale de la base y no de lo que tenga cargado el navegador:
      // así incluye todas las facturas del período, no solo las de la pantalla.
      const facturas = await prisma.facturas.findMany({
        where:
          periodo.desde && periodo.hasta
            ? { fecha_facturacion: { gte: periodo.desde, lte: periodo.hasta } }
            : {},
        include: { clientes: true, paquetes: { include: { categorias: true } }, usuarios: true },
        orderBy: { fecha_facturacion: 'asc' },
      })

      const excel = await generarExcelFacturas(facturas, periodo.etiqueta)

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${periodo.nombreArchivo}.xlsx"`)
      // El navegador necesita leer el nombre del archivo desde JavaScript.
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
      res.send(excel)
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/facturas/:id — protegido
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const factura = await prisma.facturas.findUnique({
      where: { id: Number(req.params.id) },
      include: { clientes: true, paquetes: { include: { categorias: true } }, usuarios: true }
    })
    if (!factura) {
      res.status(404).json({ error: 'Factura no encontrada' })
      return
    }
    res.json(factura)
  } catch (err) {
    next(err)
  }
})

// POST /api/facturas — protegido (asigna automáticamente el usuario del token)
router.post('/', authMiddleware, validate(facturaSchema), async (req: AuthRequest, res, next) => {
  try {
    const { cliente_id, paquete_id, fecha_facturacion, fecha_proximo_pago, origen } = req.body
    const [cliente, paquete] = await Promise.all([
      prisma.clientes.findUnique({ where: { id: cliente_id } }),
      prisma.paquetes.findUnique({ where: { id: paquete_id } }),
    ])
    if (!cliente) {
      res.status(400).json({ error: 'El cliente seleccionado no existe' })
      return
    }
    if (!paquete) {
      res.status(400).json({ error: 'El paquete seleccionado no existe' })
      return
    }
    const importe = calcularImporte(paquete, req.body)
    if (!importe) {
      res.status(400).json({ error: errorImporte(paquete) })
      return
    }
    const proximoPago = resolverProximoPago(esPagoUnico(paquete), fecha_proximo_pago)
    if (!proximoPago.ok) {
      res.status(400).json({ error: ERROR_PROXIMO_PAGO })
      return
    }

    const factura = await prisma.facturas.create({
      data: {
        cliente_id,
        paquete_id,
        ...(fecha_facturacion ? { fecha_facturacion: new Date(fecha_facturacion) } : {}),
        fecha_proximo_pago: proximoPago.valor,
        origen: origen || null,
        ...importe,
        usuario_id: req.usuarioId,
      },
      include: { clientes: true, paquetes: { include: { categorias: true } } }
    })
    res.status(201).json(factura)
  } catch (err) {
    next(err)
  }
})

// PUT /api/facturas/:id — protegido
router.put('/:id', authMiddleware, validate(facturaSchema), async (req, res, next) => {
  try {
    const { cliente_id, paquete_id, fecha_facturacion, fecha_proximo_pago, origen } = req.body
    const paquete = await prisma.paquetes.findUnique({ where: { id: paquete_id } })
    if (!paquete) {
      res.status(400).json({ error: 'El paquete seleccionado no existe' })
      return
    }
    const importe = calcularImporte(paquete, req.body)
    if (!importe) {
      res.status(400).json({ error: errorImporte(paquete) })
      return
    }
    const proximoPago = resolverProximoPago(esPagoUnico(paquete), fecha_proximo_pago)
    if (!proximoPago.ok) {
      res.status(400).json({ error: ERROR_PROXIMO_PAGO })
      return
    }
    const factura = await prisma.facturas.update({
      where: { id: Number(req.params.id) },
      data: {
        cliente_id,
        paquete_id,
        ...(fecha_facturacion ? { fecha_facturacion: new Date(fecha_facturacion) } : {}),
        fecha_proximo_pago: proximoPago.valor,
        origen: origen || null,
        ...importe,
      }
    })
    res.json(factura)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/facturas/:id — protegido
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.facturas.delete({
      where: { id: Number(req.params.id) }
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
