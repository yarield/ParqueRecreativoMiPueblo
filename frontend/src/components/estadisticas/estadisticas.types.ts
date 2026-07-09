import type { Resumen, ClientesPorMes, PaqueteVendido } from '@/types/estadisticas'

export interface ResumenCardsProps {
  resumen: Resumen
}

export interface StatCardProps {
  titulo: string
  valor: string | number
  subtitulo?: string
}

export interface ClientesPorMesChartProps {
  datos: ClientesPorMes[]
}

export interface PaquetesVendidosChartProps {
  datos: PaqueteVendido[]
}
