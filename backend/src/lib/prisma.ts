import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Prisma } from '../generated/prisma/client'
import { env } from '../config/env'
import { auditContext } from './auditContext'
import { logger } from './logger'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const basePrisma = new PrismaClient({ adapter })

// Modelos cuyos create/update/delete quedan registrados en `auditoria`.
// `auditoria` queda afuera a propósito: nunca se audita a sí misma.
const MODELOS_AUDITADOS = new Set(['clientes', 'paquetes', 'categorias', 'facturas', 'usuarios'])

type Accion = 'create' | 'update' | 'delete'
type Registro = Record<string, unknown> & { id?: number }

// El hash de la contraseña no debe quedar dando vueltas en el historial de auditoría.
function serializar(modelo: string, registro: Registro): Prisma.InputJsonValue {
  const copia: Registro = { ...registro }
  if (modelo === 'usuarios') delete copia.password_hash
  return JSON.parse(JSON.stringify(copia))
}

// Usa `basePrisma` (el cliente sin extender) para no volver a disparar estos
// mismos hooks al escribir en `auditoria`.
async function registrarAuditoria(
  modelo: string,
  accion: Accion,
  registroId: number | undefined,
  datosAnteriores: Registro | null,
  datosNuevos: Registro | null
) {
  if (registroId === undefined) return
  try {
    await basePrisma.auditoria.create({
      data: {
        tabla: modelo,
        registro_id: registroId,
        accion,
        usuario_id: auditContext.getStore()?.usuarioId,
        datos_anteriores: datosAnteriores ? serializar(modelo, datosAnteriores) : undefined,
        datos_nuevos: datosNuevos ? serializar(modelo, datosNuevos) : undefined,
      },
    })
  } catch (err) {
    // Un fallo al auditar no debe tumbar la operación real, que ya se hizo.
    logger.error({ err, modelo, accion, registroId }, 'No se pudo registrar la auditoría')
  }
}

const prisma = basePrisma.$extends({
  name: 'auditoria',
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const resultado = (await query(args)) as Registro
        if (MODELOS_AUDITADOS.has(model)) {
          await registrarAuditoria(model, 'create', resultado.id, null, resultado)
        }
        return resultado
      },
      async update({ model, args, query }) {
        const auditado = MODELOS_AUDITADOS.has(model)
        const anterior = auditado
          ? ((await (basePrisma as any)[model].findUnique({ where: args.where })) as Registro | null)
          : null
        const resultado = (await query(args)) as Registro
        if (auditado) {
          await registrarAuditoria(model, 'update', resultado.id, anterior, resultado)
        }
        return resultado
      },
      async delete({ model, args, query }) {
        const auditado = MODELOS_AUDITADOS.has(model)
        const anterior = auditado
          ? ((await (basePrisma as any)[model].findUnique({ where: args.where })) as Registro | null)
          : null
        const resultado = (await query(args)) as Registro
        if (auditado) {
          await registrarAuditoria(model, 'delete', anterior?.id ?? resultado?.id, anterior, null)
        }
        return resultado
      },
    },
  },
})

export default prisma
