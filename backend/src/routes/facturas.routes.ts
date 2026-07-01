import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { AuthRequest } from '../middlewares/auth'

const router = Router()

// GET /api/facturas — protegido
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const facturas = await prisma.facturas.findMany({
      include: { clientes: true, paquetes: true, usuarios: true },
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
      include: { clientes: true, paquetes: true, usuarios: true }
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
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const factura = await prisma.facturas.create({
      data: {
        ...req.body,
        usuario_id: req.usuarioId
      },
      include: { clientes: true, paquetes: true }
    })
    res.status(201).json(factura)
  } catch (err) {
    next(err)
  }
})

// PUT /api/facturas/:id — protegido
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const factura = await prisma.facturas.update({
      where: { id: Number(req.params.id) },
      data: req.body
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
