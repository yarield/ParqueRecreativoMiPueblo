import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /api/facturas
router.get('/', async (_req, res) => {
  const facturas = await prisma.facturas.findMany({
    include: { clientes: true, paquetes: true, usuarios: true }
  })
  res.json(facturas)
})

// GET /api/facturas/:id
router.get('/:id', async (req, res) => {
  const factura = await prisma.facturas.findUnique({
    where: { id: Number(req.params.id) },
    include: { clientes: true, paquetes: true, usuarios: true }
  })
  if (!factura) {
    res.status(404).json({ error: 'Factura no encontrada' })
    return
  }
  res.json(factura)
})

// POST /api/facturas
router.post('/', async (req, res) => {
  const factura = await prisma.facturas.create({
    data: req.body
  })
  res.status(201).json(factura)
})

// PUT /api/facturas/:id
router.put('/:id', async (req, res) => {
  const factura = await prisma.facturas.update({
    where: { id: Number(req.params.id) },
    data: req.body
  })
  res.json(factura)
})

// DELETE /api/facturas/:id
router.delete('/:id', async (req, res) => {
  await prisma.facturas.delete({
    where: { id: Number(req.params.id) }
  })
  res.status(204).send()
})

export default router
