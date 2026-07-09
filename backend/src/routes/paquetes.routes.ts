import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { paqueteCreateSchema, paqueteUpdateSchema } from '../schemas/validation'

const router = Router()

// GET /api/paquetes — público
router.get('/', async (_req, res, next) => {
  try {
    const paquetes = await prisma.paquetes.findMany({
      include: { categorias: true }
    })
    res.json(paquetes)
  } catch (err) {
    next(err)
  }
})

// GET /api/paquetes/:id — público
router.get('/:id', async (req, res, next) => {
  try {
    const paquete = await prisma.paquetes.findUnique({
      where: { id: Number(req.params.id) },
      include: { categorias: true }
    })
    if (!paquete) {
      res.status(404).json({ error: 'Paquete no encontrado' })
      return
    }
    res.json(paquete)
  } catch (err) {
    next(err)
  }
})

// POST /api/paquetes — protegido
router.post('/', authMiddleware, validate(paqueteCreateSchema), async (req, res, next) => {
  try {
    const categoria = await prisma.categorias.findUnique({ where: { id: req.body.categoria_id } })
    if (!categoria) {
      res.status(400).json({ error: 'La categoría seleccionada no existe' })
      return
    }
    const paquete = await prisma.paquetes.create({ data: req.body })
    res.status(201).json(paquete)
  } catch (err) {
    next(err)
  }
})

// PUT /api/paquetes/:id — protegido
router.put('/:id', authMiddleware, validate(paqueteUpdateSchema), async (req, res, next) => {
  try {
    if (req.body.categoria_id !== undefined) {
      const categoria = await prisma.categorias.findUnique({ where: { id: req.body.categoria_id } })
      if (!categoria) {
        res.status(400).json({ error: 'La categoría seleccionada no existe' })
        return
      }
    }
    const paquete = await prisma.paquetes.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(paquete)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/paquetes/:id — protegido
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.paquetes.delete({
      where: { id: Number(req.params.id) }
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
