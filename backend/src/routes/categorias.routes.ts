import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest, requireRole } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { categoriaCreateSchema, categoriaUpdateSchema } from '../schemas/validation'
import { logger } from '../lib/logger'

const router = Router()

// GET /api/categorias — protegido (Control 1: exige sesión activa, PR.AA-01)
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const categorias = await prisma.categorias.findMany()
    res.json(categorias)
  } catch (err) {
    next(err)
  }
})

// GET /api/categorias/:id — protegido (Control 1: exige sesión activa, PR.AA-01)
router.get('/:id', authMiddleware, async (req, res, next) => {
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

// POST /api/categorias — protegido, solo admin (Control 2: RBAC, PR.AA-05)
router.post('/', authMiddleware, requireRole('admin'), validate(categoriaCreateSchema), async (req: AuthRequest, res, next) => {
  try {
    const categoria = await prisma.categorias.create({ data: req.body })
    logger.info({ categoriaId: categoria.id, usuarioEmail: req.usuarioEmail }, 'Categoría creada')
    res.status(201).json(categoria)
  } catch (err) {
    next(err)
  }
})

// PUT /api/categorias/:id — protegido, solo admin (Control 2: RBAC, PR.AA-05)
router.put('/:id', authMiddleware, requireRole('admin'), validate(categoriaUpdateSchema), async (req: AuthRequest, res, next) => {
  try {
    const categoria = await prisma.categorias.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    logger.info({ categoriaId: categoria.id, usuarioEmail: req.usuarioEmail }, 'Categoría actualizada')
    res.json(categoria)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/categorias/:id — protegido, solo admin (Controles 2 y 3: RBAC e integridad referencial)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id)
    const paquetesAsociados = await prisma.paquetes.count({ where: { categoria_id: id } })
    if (paquetesAsociados > 0) {
      res.status(409).json({ error: 'No se puede eliminar la categoría porque tiene paquetes asociados' })
      return
    }
    await prisma.categorias.delete({
      where: { id }
    })
    logger.info({ categoriaId: id, usuarioEmail: req.usuarioEmail }, 'Categoría eliminada')
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
