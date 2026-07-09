import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { categoriaCreateSchema, categoriaUpdateSchema } from '../schemas/validation'

const router = Router()

// GET /api/categorias — público
router.get('/', async (_req, res, next) => {
  try {
    const categorias = await prisma.categorias.findMany()
    res.json(categorias)
  } catch (err) {
    next(err)
  }
})

// GET /api/categorias/:id — público
router.get('/:id', async (req, res, next) => {
  try {
    const categoria = await prisma.categorias.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!categoria) {
      res.status(404).json({ error: 'Categoría no encontrada' })
      return
    }
    res.json(categoria)
  } catch (err) {
    next(err)
  }
})

// POST /api/categorias — protegido
router.post('/', authMiddleware, validate(categoriaCreateSchema), async (req, res, next) => {
  try {
    const categoria = await prisma.categorias.create({ data: req.body })
    res.status(201).json(categoria)
  } catch (err) {
    next(err)
  }
})

// PUT /api/categorias/:id — protegido
router.put('/:id', authMiddleware, validate(categoriaUpdateSchema), async (req, res, next) => {
  try {
    const categoria = await prisma.categorias.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(categoria)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/categorias/:id — protegido
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.categorias.delete({
      where: { id: Number(req.params.id) }
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
