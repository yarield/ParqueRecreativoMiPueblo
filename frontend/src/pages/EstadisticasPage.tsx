import ResumenCards from '@/components/estadisticas/ResumenCards'
import ClientesPorMesChart from '@/components/estadisticas/ClientesPorMesChart'
import PaquetesVendidosChart from '@/components/estadisticas/PaquetesVendidosChart'
import GananciasChart from '@/components/estadisticas/GananciasChart'
import { useResumen, useClientesPorMes, usePaquetesVendidos } from '@/hooks/useEstadisticas'
import { ESTADISTICAS_LABELS } from '@/constants/estadisticas.constants'

export default function EstadisticasPage() {
  const { data: resumen, isLoading: loadingResumen } = useResumen()
  const { data: clientesPorMes = [] } = useClientesPorMes()
  const { data: paquetesVendidos = [] } = usePaquetesVendidos()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{ESTADISTICAS_LABELS.titulo}</h2>

      {loadingResumen ? (
        <p className="text-gray-400">{ESTADISTICAS_LABELS.cargando}</p>
      ) : resumen ? (
        <ResumenCards resumen={resumen} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ClientesPorMesChart datos={clientesPorMes} />
        <PaquetesVendidosChart datos={paquetesVendidos} />
      </div>

      <GananciasChart />
    </div>
  )
}
