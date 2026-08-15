export type PeriodoModo = 'rango' | 'mes' | 'total'

export interface Periodo {
  // Límites inclusivos sobre fecha_facturacion. null = sin límite por ese lado.
  desde: Date | null
  hasta: Date | null
  // Cómo se describe el período dentro del archivo y en su nombre.
  etiqueta: string
  nombreArchivo: string
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const ETIQUETA_TOTAL = 'Todas las facturas'
const PREFIJO_ARCHIVO = 'facturacion'

// Las fechas se guardan como fecha pura (medianoche UTC). Interpretarlas en
// hora local correría un día en zonas UTC negativas, así que se fuerza UTC.
const fechaUTC = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00.000Z`)

const formatear = (fecha: Date) =>
  `${String(fecha.getUTCDate()).padStart(2, '0')}/${String(fecha.getUTCMonth() + 1).padStart(2, '0')}/${fecha.getUTCFullYear()}`

const iso = (fecha: Date) => fecha.toISOString().slice(0, 10)

/**
 * Traduce el modo elegido en el reporte a un rango de fechas concreto, más los
 * textos con que se identifica ese período.
 */
export function resolverPeriodo(modo: PeriodoModo, desde?: string, hasta?: string, mes?: string): Periodo {
  if (modo === 'rango' && desde && hasta) {
    const inicio = fechaUTC(desde)
    const fin = fechaUTC(hasta)
    return {
      desde: inicio,
      hasta: fin,
      etiqueta: `Del ${formatear(inicio)} al ${formatear(fin)}`,
      nombreArchivo: `${PREFIJO_ARCHIVO}_${iso(inicio)}_${iso(fin)}`,
    }
  }

  if (modo === 'mes' && mes) {
    const [anio, numeroMes] = mes.split('-').map(Number)
    const inicio = new Date(Date.UTC(anio, numeroMes - 1, 1))
    // Día 0 del mes siguiente = último día de este mes.
    const fin = new Date(Date.UTC(anio, numeroMes, 0))
    return {
      desde: inicio,
      hasta: fin,
      etiqueta: `${MESES[numeroMes - 1]} ${anio}`,
      nombreArchivo: `${PREFIJO_ARCHIVO}_${mes}`,
    }
  }

  return {
    desde: null,
    hasta: null,
    etiqueta: ETIQUETA_TOTAL,
    nombreArchivo: `${PREFIJO_ARCHIVO}_total`,
  }
}
