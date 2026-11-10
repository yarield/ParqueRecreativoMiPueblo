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

// En estos modelos la operación y su fila de auditoría se escriben en la misma
// transacción: si la auditoría falla, la operación se deshace. Una factura no
// puede cambiar sin dejar rastro.
const MODELOS_AUDITORIA_ESTRICTA = new Set(['facturas'])

type Accion = 'create' | 'update' | 'delete'
type Registro = Record<string, unknown> & { id?: number }
type ClienteTx = Prisma.TransactionClient

// El hash de la contraseña no debe quedar dando vueltas en el historial de auditoría.
function serializar(modelo: string, registro: Registro): Prisma.InputJsonValue {
  const copia: Registro = { ...registro }
  if (modelo === 'usuarios') delete copia.password_hash
  return JSON.parse(JSON.stringify(copia))
}

// Además del id se guarda el email del responsable: si el usuario deja de
// existir, la fila sigue diciendo quién hizo el cambio.
function datosAuditoria(
  modelo: string,
  accion: Accion,
  registroId: number,
  datosAnteriores: Registro | null,
  datosNuevos: Registro | null
) {
  const actor = auditContext.getStore()
  return {
    tabla: modelo,
    registro_id: registroId,
    accion,
    usuario_id: actor?.usuarioId,
    usuario_email: actor?.usuarioEmail,
    datos_anteriores: datosAnteriores ? serializar(modelo, datosAnteriores) : undefined,
    datos_nuevos: datosNuevos ? serializar(modelo, datosNuevos) : undefined,
  }
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
      data: datosAuditoria(modelo, accion, registroId, datosAnteriores, datosNuevos),
    })
  } catch (err) {
    // Un fallo al auditar no debe tumbar la operación real, que ya se hizo.
    logger.error({ err, modelo, accion, registroId }, 'No se pudo registrar la auditoría')
  }
}

// Ejecuta la operación y su auditoría en una sola transacción. Si el insert en
// `auditoria` falla, el error sube y Postgres deshace también la operación.
// Corre sobre el cliente sin extender, así que no vuelve a pasar por los hooks.
function operarConAuditoria(modelo: string, accion: Accion, args: unknown) {
  return basePrisma.$transaction(async (tx) => {
    const delegado = (tx as ClienteTx & Record<string, any>)[modelo]
    const anterior =
      accion === 'create'
        ? null
        : ((await delegado.findUnique({ where: (args as { where: unknown }).where })) as Registro | null)
    const resultado = (await delegado[accion](args)) as Registro
    const registroId = anterior?.id ?? resultado?.id
    if (registroId !== undefined) {
      await tx.auditoria.create({
        data: datosAuditoria(modelo, accion, registroId, anterior, accion === 'delete' ? null : resultado),
      })
    }
    return resultado
  })
}

const prisma = basePrisma.$extends({
  name: 'auditoria',
  query: {
    $allModels: {
      async create({ model, args, query }) {
        if (MODELOS_AUDITORIA_ESTRICTA.has(model)) return operarConAuditoria(model, 'create', args)
        const resultado = (await query(args)) as Registro
        if (MODELOS_AUDITADOS.has(model)) {
          await registrarAuditoria(model, 'create', resultado.id, null, resultado)
        }
        return resultado
      },
      async update({ model, args, query }) {
        if (MODELOS_AUDITORIA_ESTRICTA.has(model)) return operarConAuditoria(model, 'update', args)
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
        if (MODELOS_AUDITORIA_ESTRICTA.has(model)) return operarConAuditoria(model, 'delete', args)
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
