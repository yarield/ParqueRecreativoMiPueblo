import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Prisma: valor único duplicado (email, cedula, etc.)
  if (err.code === 'P2002') {
    res.status(409).json({ error: 'Ya existe un registro con ese valor' })
    return
  }
  // Prisma: registro no encontrado al actualizar o eliminar
  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Registro no encontrado' })
    return
  }
  // Prisma: violación de llave foránea
  if (err.code === 'P2003') {
    res.status(400).json({ error: 'El registro relacionado no existe' })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
