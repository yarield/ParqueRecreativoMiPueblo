import { Router } from 'express'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { validateQuery, QueryRequest } from '../middlewares/validate'
import { auditoriaQuerySchema, AuditoriaQuery } from '../schemas/validation'

const router = Router()

// GET /api/auditoria — protegido y de solo lectura: no hay POST/PUT/DELETE.
// La tabla solo la escribe la extensión de Prisma en lib/prisma.ts.
router.get(
  '/',
  authMiddleware,
  validateQuery(auditoriaQuerySchema),
  async (req: QueryRequest<AuditoriaQuery>, res, next) => {
    try {
      const { tabla, accion, registro_id, usuario_id, desde, hasta, pagina, por_pagina } = req.datosQuery!

      const where = {
        ...(tabla ? { tabla } : {}),
        ...(accion ? { accion } : {}),
        ...(registro_id ? { registro_id } : {}),
        ...(usuario_id ? { usuario_id } : {}),
        ...(desde || hasta
          ? {
              fecha: {
                ...(desde ? { gte: new Date(desde) } : {}),
                ...(hasta ? { lte: new Date(`${hasta}T23:59:59.999`) } : {}),
              },
            }
          : {}),
      }

      const [total, eventos] = await Promise.all([
        prisma.auditoria.count({ where }),
        prisma.auditoria.findMany({
          where,
          include: { usuarios: { select: { id: true, nombre: true, email: true } } },
          orderBy: { fecha: 'desc' },
          skip: (pagina - 1) * por_pagina,
          take: por_pagina,
        }),
      ])

      res.json({ total, pagina, por_pagina, eventos })
    } catch (err) {
      next(err)
    }
  }
)

export default router
