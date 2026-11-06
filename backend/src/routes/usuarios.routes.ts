import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware, requireRole } from '../middlewares/auth'

const router = Router()

// GET /api/usuarios — restringido a administradores. Antes, cualquier
// cuenta autenticada veía el directorio completo (nombre + email de todos,
// incluido el admin real); ver PoC de escalación de privilegios, módulo
// Autenticación. Reutiliza requireRole del PoC1 de Rachel/Clientes en vez de
// un middleware propio, para no duplicar el mismo control dos veces.
router.get('/', authMiddleware, requireRole('admin'), async (_req, res, next) => {
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
