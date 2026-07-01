import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTADISTICAS_LABELS } from '@/constants/estadisticas.constants'
import type { Resumen } from '@/types/estadisticas'

interface Props {
  resumen: Resumen
}

interface CardItemProps {
  titulo: string
  valor: string | number
  subtitulo?: string
}

function StatCard({ titulo, valor, subtitulo }: CardItemProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{valor}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
      </CardContent>
    </Card>
  )
}

export default function ResumenCards({ resumen }: Props) {
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
        titulo={ESTADISTICAS_LABELS.totalGanancias}
        valor={`$${resumen.totalGanancias.toFixed(2)}`}
      />
    </div>
  )
}
