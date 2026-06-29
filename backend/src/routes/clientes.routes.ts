import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/clientes
router.get('/', async (_req, res) => {
  const clientes = await prisma.clientes.findMany()
  res.json(clientes)
})

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  const cliente = await prisma.clientes.findUnique({
    where: { id: Number(req.params.id) }
  })
  if (!cliente) {
    res.status(404).json({ error: 'Cliente no encontrado' })
    return
  }
  res.json(cliente)
})

// POST /api/clientes
router.post('/', async (req, res) => {
  const cliente = await prisma.clientes.create({
    data: req.body
  })
  res.status(201).json(cliente)
})

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  const cliente = await prisma.clientes.update({
    where: { id: Number(req.params.id) },
    data: req.body
  })
  res.json(cliente)
})

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  await prisma.clientes.delete({
    where: { id: Number(req.params.id) }
  })
  res.status(204).send()
})

export default router
