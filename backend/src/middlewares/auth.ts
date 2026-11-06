import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { auditContext } from '../lib/auditContext'

export interface AuthRequest extends Request {
  usuarioId?: number
  usuarioEmail?: string
  usuarioRol?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // El JWT viaja en una cookie HttpOnly, no en el header Authorization (ver
  // PoC "JWT en localStorage", módulo Autenticación): así, un script que
  // logre ejecutarse en el navegador (XSS) nunca puede leer el token, aunque
  // sí lo seguiría adjuntando el navegador en cada petición, como siempre.
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  try {
  const payload = jwt.verify(token, env.JWT_SECRET) as { id: number; email: string; rol: string }
    req.usuarioId = payload.id
    req.usuarioEmail = payload.email
    req.usuarioRol = payload.rol
    auditContext.run({ usuarioId: payload.id, usuarioEmail: payload.email }, next)
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Exige un rol mínimo para continuar. Se usa después de authMiddleware, que
// ya puso req.usuarioRol a partir del JWT. Ver PoC1 (Falta de Autorización):
// antes de esto, cualquier token válido —sin importar el rol de la cuenta—
// podía ejecutar operaciones irreversibles como borrar un cliente.
export function requireRole(rolMinimo: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.usuarioRol !== rolMinimo) {
      res.status(403).json({ error: 'No tiene permisos para esta acción' })
      return
    }
    next()
  }
}
