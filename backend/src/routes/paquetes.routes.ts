import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest, requireRole } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { paqueteCreateSchema, paqueteUpdateSchema } from '../schemas/validation'
import { logger } from '../lib/logger'

const router = Router()

// GET /api/paquetes — protegido (Control 1: exige sesión activa, PR.AA-01)
router.get('/', authMiddleware, async (_req, res, next) => {
  try {
    const paquetes = await prisma.paquetes.findMany({
      include: { categorias: true }
    })
    res.json(paquetes)
  } catch (err) {
    next(err)
  }
})

// GET /api/paquetes/:id — protegido (Control 1: exige sesión activa, PR.AA-01)
router.get('/:id', authMiddleware, async (req, res, next) => {
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

// POST /api/paquetes — protegido, solo admin (Control 2: RBAC, PR.AA-05)
router.post('/', authMiddleware, requireRole('admin'), validate(paqueteCreateSchema), async (req: AuthRequest, res, next) => {
  try {
    const categoria = await prisma.categorias.findUnique({ where: { id: req.body.categoria_id } })
    if (!categoria) {
      res.status(400).json({ error: 'La categoría seleccionada no existe' })
      return
    }
    const paquete = await prisma.paquetes.create({ data: req.body })
    logger.info({ paqueteId: paquete.id, usuarioEmail: req.usuarioEmail }, 'Paquete creado')
    res.status(201).json(paquete)
  } catch (err) {
    next(err)
  }
})

// PUT /api/paquetes/:id — protegido, solo admin (Controles 2 y 4: RBAC e integridad en update parcial)
router.put('/:id', authMiddleware, requireRole('admin'), validate(paqueteUpdateSchema), async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id)
    const actual = await prisma.paquetes.findUnique({ where: { id } })
    if (!actual) {
      res.status(404).json({ error: 'Paquete no encontrado' })
      return
    }

    // Control 4 (PR.DS-01): valida las invariantes de precio y modo combinando
    // el estado actual en base de datos con los campos enviados en el update parcial.
    const modoFinal = {
      precio_abierto: req.body.precio_abierto ?? actual.precio_abierto,
      cobro_por_noche: req.body.cobro_por_noche ?? actual.cobro_por_noche,
      precio: req.body.precio !== undefined ? req.body.precio : actual.precio,
    }
    if (modoFinal.precio_abierto && modoFinal.cobro_por_noche) {
      res.status(400).json({ error: 'Un paquete no puede ser de precio abierto y por noche a la vez' })
      return
    }
    if (!modoFinal.precio_abierto && !modoFinal.cobro_por_noche && modoFinal.precio == null) {
      res.status(400).json({ error: 'El precio es requerido en un paquete de precio fijo' })
      return
    }

    if (req.body.categoria_id !== undefined) {
      const categoria = await prisma.categorias.findUnique({ where: { id: req.body.categoria_id } })
      if (!categoria) {
        res.status(400).json({ error: 'La categoría seleccionada no existe' })
        return
      }
    }
    const paquete = await prisma.paquetes.update({
      where: { id },
      data: req.body
    })
    logger.info({ paqueteId: paquete.id, usuarioEmail: req.usuarioEmail }, 'Paquete actualizado')
    res.json(paquete)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/paquetes/:id — protegido, solo admin (Controles 2 y 3: RBAC y desactivación lógica)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const paquete = await prisma.paquetes.update({
      where: { id: Number(req.params.id) },
      data: { estado: 'inactivo' }
    })
    logger.info({ paqueteId: paquete.id, usuarioEmail: req.usuarioEmail }, 'Paquete desactivado lógicamente')
    res.status(200).json(paquete)
  } catch (err) {
    next(err)
  }
})

export default router
