import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// GET /api/clientes — protegido
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { nombre: 'asc' }
    })
    res.json(clientes)
  } catch (err) {
    next(err)
  }
})

// GET /api/clientes/proximos-a-vencer — protegido
// Devuelve clientes cuyo próximo pago vence en los próximos 7 días
router.get('/proximos-a-vencer', authMiddleware, async (_req, res, next) => {
  try {
    const hoy = new Date()
    const en7dias = new Date()
    en7dias.setDate(hoy.getDate() + 7)

    const facturas = await prisma.facturas.findMany({
      where: {
        fecha_proximo_pago: { gte: hoy, lte: en7dias }
      },
      include: { clientes: true, paquetes: true },
      orderBy: { fecha_proximo_pago: 'asc' }
    })
    res.json(facturas)
  } catch (err) {
    next(err)
  }
})

// GET /api/clientes/:id — protegido
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: Number(req.params.id) },
      include: { facturas: { include: { paquetes: true } } }
    })
    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' })
      return
    }
    res.json(cliente)
  } catch (err) {
    next(err)
  }
})

// POST /api/clientes — protegido
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const cliente = await prisma.clientes.create({ data: req.body })
    res.status(201).json(cliente)
  } catch (err) {
    next(err)
  }
})

// PUT /api/clientes/:id — protegido
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const cliente = await prisma.clientes.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(cliente)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/clientes/:id — protegido
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.clientes.delete({
      where: { id: Number(req.params.id) }
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
