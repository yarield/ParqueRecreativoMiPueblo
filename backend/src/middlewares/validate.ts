import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'

/**
 * Valida y sanea `req.body` contra un schema de Zod. Al reemplazar el body por
 * el resultado parseado, se descartan campos desconocidos (evita inyección de
 * `id` u otros) y se aplican coerciones y valores por defecto.
 */
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message ?? 'Datos inválidos' })
      return
    }
    req.body = result.data
    next()
  }
}

export interface QueryRequest<T> extends Request {
  datosQuery?: T
}

/**
 * Igual que `validate`, pero para los parámetros de la URL (`?desde=...`). En
 * Express 5 `req.query` es de solo lectura, así que el resultado ya parseado se
 * expone en `req.datosQuery` en vez de reemplazarlo.
 */
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: QueryRequest<T>, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message ?? 'Parámetros inválidos' })
      return
    }
    req.datosQuery = result.data
    next()
  }
}
