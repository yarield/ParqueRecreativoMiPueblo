import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// Get api/categories
router.get('/', async (_req, res) => {
    const categorias = await prisma.categorias.findMany()
    res.json(categorias)
})

// Get api/categories/:id
router.get('/:id', async (req, res) => {
    const categoria = await prisma.categorias.findUnique({
        where: {
            id: Number(req.params.id)
        }
    })
    if (!categoria) {
        res.status(404).json({ error: 'Categoria not found' })
        return
    }
    res.json(categoria)
})

// Post api/categories
router.post('/', async (req, res) => {
    const categoria = await prisma.categorias.create({
        data: req.body
    })
    res.status(201).json(categoria)
})

// Put api/categories/:id
router.put('/:id', async (req, res) => {
    const categoria = await prisma.categorias.update({
        where: {
            id: Number(req.params.id)
        },
        data: req.body
    })
    res.json(categoria)


})

// Delete api/categories/:id
router.delete('/:id', async (req, res) => {
    const categoria = await prisma.categorias.delete({
        where: {
            id: Number(req.params.id)
        }
    })
    res.status(204).send()
})
export default router