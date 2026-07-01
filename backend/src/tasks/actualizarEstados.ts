import prisma from '../lib/prisma'

const DIAS_GRACIA = 3
const INTERVALO_MS = 24 * 60 * 60 * 1000

async function actualizarClientesInactivos() {
  const limite = new Date()
  limite.setDate(limite.getDate() - DIAS_GRACIA)

  const facturasVencidas = await prisma.facturas.findMany({
    where: { fecha_proximo_pago: { lt: limite } },
    select: { cliente_id: true },
  })

  const clienteIds = [...new Set(facturasVencidas.map((f) => f.cliente_id))]

  if (clienteIds.length === 0) return

  await prisma.clientes.updateMany({
    where: { id: { in: clienteIds }, estado: 'activo' },
    data: { estado: 'inactivo' },
  })

  console.log(`[tarea] ${clienteIds.length} cliente(s) marcados como inactivos por pago vencido`)
}

export function iniciarTareaEstados() {
  actualizarClientesInactivos()
  setInterval(actualizarClientesInactivos, INTERVALO_MS)
}
