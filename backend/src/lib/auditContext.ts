import { AsyncLocalStorage } from 'node:async_hooks'

export interface AuditContext {
  usuarioId?: number
  usuarioEmail?: string
}

// Hace disponible al usuario autenticado dentro de cualquier código que corra
// durante la petición (incluida la extensión de Prisma que escribe la
// auditoría), sin tener que pasarlo a mano por cada llamada a prisma.X.create/
// update/delete.
export const auditContext = new AsyncLocalStorage<AuditContext>()
