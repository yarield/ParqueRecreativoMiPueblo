import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Prisma: valor único duplicado (email, cedula, etc.)
  if (err.code === 'P2002') {
    const fields: string[] =
      err.meta?.driverAdapterError?.cause?.constraint?.fields ??
      (Array.isArray(err.meta?.target) ? err.meta.target : err.meta?.target ? [err.meta.target] : [])
    if (fields.includes('cedula')) {
      res.status(409).json({ error: 'Ya existe un cliente registrado con esa cédula' })
      return
    }
    res.status(409).json({ error: 'Ya existe un registro con ese valor' })
    return
  }
  // Prisma: registro no encontrado al actualizar o eliminar
  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Registro no encontrado' })
    return
  }
  // Prisma: violación de llave foránea (borrar un registro que otros aún referencian)
  if (err.code === 'P2003') {
    const modelName: string | undefined = err.meta?.modelName
    const registrosAsociados: Record<string, string> = {
      categorias: 'paquetes asociados',
      clientes: 'facturas asociadas',
      paquetes: 'facturas asociadas',
    }
    const detalle = modelName && registrosAsociados[modelName]
    if (detalle) {
      res.status(409).json({ error: `No se puede eliminar: tiene ${detalle}` })
      return
    }
    res.status(400).json({ error: 'El registro relacionado no existe' })
    return
  }
  // Prisma: valor demasiado largo para la columna
  if (err.code === 'P2000') {
    res.status(400).json({ error: 'Un valor excede la longitud permitida' })
    return
  }
  // Prisma: datos con tipo/forma inválida (última red de seguridad; la
  // validación con Zod normalmente lo captura antes con un mensaje más claro).
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
