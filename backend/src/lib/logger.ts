import pino from 'pino'
import { env } from '../config/env'

// Logger central. En desarrollo imprime formateado y en color; en producción
// escribe JSON por línea a stdout (PM2 lo captura y persiste con `pm2 logs`).
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } },
})
