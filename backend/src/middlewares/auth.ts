import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  usuarioId?: number
  usuarioEmail?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { id: number; email: string }
    req.usuarioId = payload.id
    req.usuarioEmail = payload.email
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
