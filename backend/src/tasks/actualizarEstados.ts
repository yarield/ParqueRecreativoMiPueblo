import prisma from '../lib/prisma'

const DIAS_GRACIA = 3
const INTERVALO_MS = 24 * 60 * 60 * 1000

async function reportarClientesEnMora() {
  const limite = new Date()
  limite.setDate(limite.getDate() - DIAS_GRACIA)

  const facturasVencidas = await prisma.facturas.findMany({
    where: { fecha_proximo_pago: { lt: limite } },
    select: { cliente_id: true },
  })

  const clienteIds = [...new Set(facturasVencidas.map((f) => f.cliente_id))]

  if (clienteIds.length === 0) return

  console.log(`[tarea] ${clienteIds.length} cliente(s) con pago vencido — revisar en /dashboard`)
  // Ya no se actualiza `estado` automáticamente: el admin revisa y decide manualmente
  // desde la vista "Clientes en mora" (GET /api/clientes/en-mora).
}

export function iniciarTareaEstados() {
  reportarClientesEnMora()
  setInterval(reportarClientesEnMora, INTERVALO_MS)
}
