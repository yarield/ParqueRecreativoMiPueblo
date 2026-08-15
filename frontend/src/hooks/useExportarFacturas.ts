import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { descargarBlob } from '@/lib/descargas'
import { EXPORTAR_ARCHIVO_POR_DEFECTO } from '@/constants/exportar.constants'
import type { FacturaExportFormData } from '@/schemas/facturasExport.schema'

// Solo viajan los parámetros del modo elegido; el resto el servidor los ignora.
function construirQuery(data: FacturaExportFormData): string {
  const params = new URLSearchParams({ modo: data.modo })
  if (data.modo === 'rango' && data.desde && data.hasta) {
    params.set('desde', data.desde)
    params.set('hasta', data.hasta)
  }
  if (data.modo === 'mes' && data.mes) {
    params.set('mes', data.mes)
  }
  return params.toString()
}

/**
 * Pide el reporte al servidor y lo baja como archivo. El Excel se arma allá, así
 * que incluye todas las facturas del período aunque la tabla esté filtrada.
 */
export function useExportarFacturas() {
  return useMutation({
    mutationFn: async (data: FacturaExportFormData) => {
      const { blob, nombreArchivo } = await api.descargar(`/facturas/exportar?${construirQuery(data)}`)
      descargarBlob(blob, nombreArchivo ?? EXPORTAR_ARCHIVO_POR_DEFECTO)
    },
  })
}
