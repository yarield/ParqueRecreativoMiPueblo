import pinoHttp from 'pino-http'
import { Request } from 'express'
import { logger } from '../lib/logger'
import { AuthRequest } from './auth'

// Registra cada petición HTTP (método, ruta, status, duración) para todos los
// módulos por igual, ya que se monta una sola vez en server.ts antes de las
// rutas. Si la petición pasó por authMiddleware, incluye el usuario autenticado.
export const requestLogger = pinoHttp({
  logger,
  // Solo lo necesario para trazar quién hizo qué: sin volcar headers completos.
  serializers: {
    req: (req) => ({ method: req.method, url: (req as Request).originalUrl ?? req.url, remoteAddress: req.remoteAddress }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customProps: (req) => {
    const usuarioEmail = (req as AuthRequest).usuarioEmail
    return usuarioEmail ? { usuarioEmail } : {}
  },
  customSuccessMessage: (req, res) => `${req.method} ${(req as Request).originalUrl} -> ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${(req as Request).originalUrl} -> ${res.statusCode} (${err.message})`,
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
})
