import { ESTADISTICAS_LABELS } from '@/constants/estadisticas.constants'
import StatCard from './StatCard'
import type { ResumenCardsProps } from './estadisticas.types'

export default function ResumenCards({ resumen }: ResumenCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard titulo={ESTADISTICAS_LABELS.totalClientes} valor={resumen.totalClientes} />
      <StatCard titulo={ESTADISTICAS_LABELS.clientesActivos} valor={resumen.clientesActivos} />
      <StatCard titulo={ESTADISTICAS_LABELS.clientesInactivos} valor={resumen.clientesInactivos} />
      <StatCard
        titulo={ESTADISTICAS_LABELS.tasaCancelacion}
        valor={`${resumen.tasaCancelacion}%`}
        subtitulo="clientes inactivos / total"
      />
      <StatCard titulo={ESTADISTICAS_LABELS.totalFacturas} valor={resumen.totalFacturas} />
      <StatCard
        titulo={ESTADISTICAS_LABELS.totalFacturado}
        valor={`$${resumen.totalFacturado.toFixed(2)}`}
      />
      <StatCard
        titulo={ESTADISTICAS_LABELS.totalGanancias}
        valor={`$${resumen.totalGanancias.toFixed(2)}`}
        subtitulo={ESTADISTICAS_LABELS.netoAyuda}
      />
    </div>
  )
}
