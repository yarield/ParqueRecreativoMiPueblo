import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Resumen, ClientesPorMes, PaqueteVendido, GananciasPorMes } from '@/types/estadisticas'

export function useResumen() {
  return useQuery<Resumen>({
    queryKey: ['estadisticas', 'resumen'],
    queryFn: () => api.get<Resumen>('/estadisticas/resumen'),
  })
}

export function useClientesPorMes() {
  return useQuery<ClientesPorMes[]>({
    queryKey: ['estadisticas', 'clientes-por-mes'],
    queryFn: () => api.get<ClientesPorMes[]>('/estadisticas/clientes-por-mes'),
  })
}

export function usePaquetesVendidos() {
  return useQuery<PaqueteVendido[]>({
    queryKey: ['estadisticas', 'paquetes-vendidos'],
    queryFn: () => api.get<PaqueteVendido[]>('/estadisticas/paquetes-vendidos'),
  })
}

export function useGanancias(desde?: string, hasta?: string) {
  const params = new URLSearchParams()
  if (desde) params.set('desde', desde)
  if (hasta) params.set('hasta', hasta)
  const query = params.toString()

  return useQuery<GananciasPorMes[]>({
    queryKey: ['estadisticas', 'ganancias', desde, hasta],
    queryFn: () => api.get<GananciasPorMes[]>(`/estadisticas/ganancias${query ? `?${query}` : ''}`),
  })
}
