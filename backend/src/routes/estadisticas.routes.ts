import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// GET /api/estadisticas/resumen
router.get('/resumen', authMiddleware, async (_req, res, next) => {
  try {
    const [totalClientes, clientesActivos, totalFacturas, ganancias] = await Promise.all([
      prisma.clientes.count(),
      prisma.clientes.count({ where: { estado: 'activo' } }),
      prisma.facturas.count(),
      prisma.facturas.aggregate({ _sum: { monto: true } }),
    ])

    const clientesInactivos = totalClientes - clientesActivos
    const tasaCancelacion = totalClientes > 0
      ? Math.round((clientesInactivos / totalClientes) * 1000) / 10
      : 0

    res.json({
      totalClientes,
      clientesActivos,
      clientesInactivos,
      tasaCancelacion,
      totalFacturas,
      totalGanancias: Math.round(Number(ganancias._sum.monto ?? 0) * 100) / 100,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/estadisticas/clientes-por-mes
router.get('/clientes-por-mes', authMiddleware, async (_req, res, next) => {
  try {
    const clientes = await prisma.clientes.findMany({
      select: { fecha_inicio: true },
      orderBy: { fecha_inicio: 'asc' },
    })

    const porMes: Record<string, number> = {}
    for (const c of clientes) {
      const mes = c.fecha_inicio.toISOString().slice(0, 7)
      porMes[mes] = (porMes[mes] ?? 0) + 1
    }

    res.json(Object.entries(porMes).map(([mes, cantidad]) => ({ mes, cantidad })))
  } catch (err) {
    next(err)
  }
})

// GET /api/estadisticas/paquetes-vendidos
router.get('/paquetes-vendidos', authMiddleware, async (_req, res, next) => {
  try {
    const facturas = await prisma.facturas.findMany({
      select: { paquete_id: true, paquetes: { select: { nombre: true } } },
    })

    const porPaquete: Record<string, { nombre: string; total: number }> = {}
    for (const f of facturas) {
      const key = String(f.paquete_id)
      if (!porPaquete[key]) porPaquete[key] = { nombre: f.paquetes.nombre, total: 0 }
      porPaquete[key].total++
    }

    res.json(
      Object.values(porPaquete)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    )
  } catch (err) {
    next(err)
  }
})

// GET /api/estadisticas/ganancias?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get('/ganancias', authMiddleware, async (req, res, next) => {
  try {
    const { desde, hasta } = req.query

    const where: { fecha_facturacion?: { gte?: Date; lte?: Date } } = {}
    if (desde) where.fecha_facturacion = { gte: new Date(String(desde)) }
    if (hasta) where.fecha_facturacion = { ...where.fecha_facturacion, lte: new Date(String(hasta)) }

    const facturas = await prisma.facturas.findMany({
      where,
      select: { fecha_facturacion: true, monto: true },
      orderBy: { fecha_facturacion: 'asc' },
    })

    const porMes: Record<string, number> = {}
    for (const f of facturas) {
      const mes = f.fecha_facturacion.toISOString().slice(0, 7)
      porMes[mes] = (porMes[mes] ?? 0) + Number(f.monto)
    }

    res.json(
      Object.entries(porMes).map(([mes, total]) => ({
        mes,
        total: Math.round(total * 100) / 100,
      }))
    )
  } catch (err) {
    next(err)
  }
})

export default router
