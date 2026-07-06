import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { AuthRequest } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { facturaSchema } from '../schemas/validation'

const router = Router()

// Recalcula precio_base, descuento (clampado) y monto desde el paquete, en vez
// de confiar en lo que envía el cliente.
function calcularImporte(precioPaquete: unknown, descuentoSolicitado: number) {
  const precio_base = Number(precioPaquete)
  const descuento_monto = Math.min(precio_base, Math.max(0, descuentoSolicitado ?? 0))
  const monto = Number((precio_base - descuento_monto).toFixed(2))
  return { precio_base, descuento_monto, monto }
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
    const { cliente_id, paquete_id, fecha_facturacion, fecha_proximo_pago, descuento_monto } = req.body
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

    const factura = await prisma.facturas.create({
      data: {
        cliente_id,
        paquete_id,
        ...(fecha_facturacion ? { fecha_facturacion: new Date(fecha_facturacion) } : {}),
        fecha_proximo_pago: new Date(fecha_proximo_pago),
        ...calcularImporte(paquete.precio, descuento_monto),
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
    const { cliente_id, paquete_id, fecha_facturacion, fecha_proximo_pago, descuento_monto } = req.body
    const paquete = await prisma.paquetes.findUnique({ where: { id: paquete_id } })
    if (!paquete) {
      res.status(400).json({ error: 'El paquete seleccionado no existe' })
      return
    }
    const factura = await prisma.facturas.update({
      where: { id: Number(req.params.id) },
      data: {
        cliente_id,
        paquete_id,
        ...(fecha_facturacion ? { fecha_facturacion: new Date(fecha_facturacion) } : {}),
        fecha_proximo_pago: new Date(fecha_proximo_pago),
        ...calcularImporte(paquete.precio, descuento_monto),
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
