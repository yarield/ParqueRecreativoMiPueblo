import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AuditoriaFiltros, AuditoriaRespuesta } from '@/types/auditoria'

const QUERY_KEY = 'auditoria'

function construirQuery(filtros: AuditoriaFiltros): string {
  const params = new URLSearchParams({
    pagina: String(filtros.pagina),
    por_pagina: String(filtros.por_pagina),
  })
  if (filtros.tabla) params.set('tabla', filtros.tabla)
  if (filtros.accion) params.set('accion', filtros.accion)
  if (filtros.desde) params.set('desde', filtros.desde)
  if (filtros.hasta) params.set('hasta', filtros.hasta)
  return params.toString()
}

export function useAuditoria(filtros: AuditoriaFiltros) {
  return useQuery<AuditoriaRespuesta>({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => api.get<AuditoriaRespuesta>(`/auditoria?${construirQuery(filtros)}`),
    placeholderData: (data) => data,
  })
}
