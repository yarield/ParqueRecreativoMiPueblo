import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/paquetes
router.get('/', async (_req, res) => {
  const paquetes = await prisma.paquetes.findMany({
    include: { categorias: true }
  })
  res.json(paquetes)
})

// GET /api/paquetes/:id
router.get('/:id', async (req, res) => {
  const paquete = await prisma.paquetes.findUnique({
    where: { id: Number(req.params.id) },
    include: { categorias: true }
  })
  if (!paquete) {
    res.status(404).json({ error: 'Paquete no encontrado' })
    return
  }
  res.json(paquete)
})

// POST /api/paquetes
router.post('/', async (req, res) => {
  const paquete = await prisma.paquetes.create({
    data: req.body
  })
  res.status(201).json(paquete)
})

// PUT /api/paquetes/:id
router.put('/:id', async (req, res) => {
  const paquete = await prisma.paquetes.update({
    where: { id: Number(req.params.id) },
    data: req.body
  })
  res.json(paquete)
})

// DELETE /api/paquetes/:id
router.delete('/:id', async (req, res) => {
  await prisma.paquetes.delete({
    where: { id: Number(req.params.id) }
  })
  res.status(204).send()
})

export default router
