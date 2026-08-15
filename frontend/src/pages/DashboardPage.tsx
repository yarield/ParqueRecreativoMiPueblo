import ClientesEnMoraTable from '@/components/dashboard/ClientesEnMoraTable'
import Paginacion from '@/components/common/Paginacion'
import { useClientesEnMora, useUpdateCliente } from '@/hooks/useClientes'
import { usePaginacion } from '@/hooks/usePaginacion'
import { DASHBOARD_LABELS } from '@/constants/dashboard.constants'
import type { ClienteEnMora } from '@/types/clientes'

export default function DashboardPage() {
  const { data: clientesEnMora = [], isLoading } = useClientesEnMora()
  const updateCliente = useUpdateCliente()

  const { items: clientesPagina, control: paginacion } = usePaginacion(clientesEnMora)

  async function handleMarcarInactivo(cliente: ClienteEnMora) {
    await updateCliente.mutateAsync({ id: cliente.id, data: { estado: 'inactivo' } })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{DASHBOARD_LABELS.titulo}</h2>
      <h3 className="text-sm font-medium text-gray-600">{DASHBOARD_LABELS.enMora}</h3>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">{DASHBOARD_LABELS.cargando}</p>
      ) : (
        <>
          <ClientesEnMoraTable clientes={clientesPagina} onMarcarInactivo={handleMarcarInactivo} />
          <Paginacion control={paginacion} />
        </>
      )}
    </div>
  )
}
