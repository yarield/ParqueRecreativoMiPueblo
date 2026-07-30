import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { AuthRequest } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { facturaSchema } from '../schemas/validation'

const router = Router()

const redondear = (n: number) => Number(n.toFixed(2))

// Resuelve a monto absoluto un valor expresado como porcentaje o como monto
// fijo, acotado al rango [0, base].
function resolverMonto(base: number, tipo: string, valor: number) {
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(valor) || valor <= 0) return 0
  const monto = tipo === 'porcentaje' ? base * (valor / 100) : valor
  return Math.min(base, Math.max(0, monto))
}

type PaquetePrecio = { precio: unknown; precio_abierto: boolean }
type FacturaBody = {
  precio_base?: number
  descuento_monto?: number
  comision_tipo?: string
  comision_valor?: number
}

// Recalcula todos los importes en el servidor en vez de confiar en lo que envía
// el cliente. El precio base solo se toma del body cuando el paquete es de
// precio abierto; si el paquete tiene precio fijo se usa el suyo y se descarta
// lo que haya llegado. Devuelve null si el precio resultante no es válido.
function calcularImporte(paquete: PaquetePrecio, body: FacturaBody) {
  const precio_base = paquete.precio_abierto
    ? Number(body.precio_base ?? NaN)
    : Number(paquete.precio ?? NaN)
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
    descuento_monto: redondear(descuento_monto),
    monto,
    comision_tipo,
    comision_valor: redondear(comision_valor),
    comision_monto,
    monto_neto: redondear(monto - comision_monto),
  }
}

const ERROR_PRECIO_ABIERTO = 'El paquete es de precio abierto: indique el precio de la factura'
const ERROR_PROXIMO_PAGO = 'La fecha de próximo pago es requerida'

// Un paquete de precio abierto se cobra una sola vez: no hay próximo pago, y se
// descarta la fecha que haya mandado el cliente. En el resto es obligatoria.
function resolverProximoPago(precioAbierto: boolean, fecha?: string | null) {
  if (precioAbierto) return { ok: true as const, valor: null }
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
      res.status(400).json({ error: ERROR_PRECIO_ABIERTO })
      return
    }
    const proximoPago = resolverProximoPago(paquete.precio_abierto, fecha_proximo_pago)
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
      res.status(400).json({ error: ERROR_PRECIO_ABIERTO })
      return
    }
    const proximoPago = resolverProximoPago(paquete.precio_abierto, fecha_proximo_pago)
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
