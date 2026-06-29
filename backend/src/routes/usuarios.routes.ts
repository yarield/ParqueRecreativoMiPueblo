import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/usuarios
router.get('/', async (_req, res) => {
  const usuarios = await prisma.usuarios.findMany({
    omit: { password_hash: true }
  })
  res.json(usuarios)
})

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: Number(req.params.id) },
    omit: { password_hash: true }
  })
  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' })
    return
  }
  res.json(usuario)
})

export default router
