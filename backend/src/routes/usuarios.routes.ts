import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// GET /api/usuarios — protegido
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      omit: { password_hash: true }
    })
    res.json(usuarios)
  } catch (err) {
    next(err)
  }
})

// GET /api/usuarios/:id — protegido
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: Number(req.params.id) },
      omit: { password_hash: true }
    })
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }
    res.json(usuario)
  } catch (err) {
    next(err)
  }
})

export default router
