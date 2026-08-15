export const EXPORTAR_LABELS = {
  boton: 'Exportar a Excel',
  titulo: 'Exportar facturación',
  periodo: 'Período',
  modoRango: 'Rango de fechas',
  modoMes: 'Por mes',
  modoTotal: 'Todo el histórico',
  desde: 'Desde',
  hasta: 'Hasta',
  mes: 'Mes',
  ayudaRango: 'Se incluyen las facturas emitidas entre ambas fechas, inclusive.',
  ayudaMes: 'Se incluye el mes completo, desde el día 1 hasta el último día.',
  ayudaTotal: 'Se incluyen todas las facturas registradas, sin filtro de fecha.',
} as const

export const EXPORTAR_MESSAGES = {
  exportar: 'Exportar',
  exportando: 'Generando archivo...',
  cancelar: 'Cancelar',
  rangoRequerido: 'Indique la fecha inicial y la final',
  rangoInvertido: 'La fecha final no puede ser anterior a la inicial',
  mesRequerido: 'Indique el mes a exportar',
  error: 'No se pudo generar el archivo',
} as const

// Nombre de respaldo si la respuesta no trae el del servidor.
export const EXPORTAR_ARCHIVO_POR_DEFECTO = 'facturacion.xlsx'
