import ExcelJS from 'exceljs'

// Forma mínima que necesita el reporte. Se declara aquí en vez de depender del
// tipo generado por Prisma para que el servicio no cambie si crece el include.
export interface FacturaExportable {
  fecha_facturacion: Date
  fecha_proximo_pago: Date | null
  precio_base: unknown
  noches: number | null
  precio_noche: unknown
  descuento_monto: unknown
  monto: unknown
  origen: string | null
  comision_monto: unknown
  monto_neto: unknown
  clientes: { nombre: string; cedula: string | null }
  paquetes: { nombre: string; categorias: { nombre: string } }
  usuarios: { nombre: string } | null
}

const TITULO = 'Reporte de facturación'
const HOJA = 'Facturación'
const SIN_DATO = '—'
const PAGO_UNICO = 'Pago único'
const TOTALES = 'Totales'

const FORMATO_MONEDA = '#,##0.00'
const FORMATO_FECHA = 'dd/mm/yyyy'

interface ColumnaReporte {
  titulo: string
  ancho: number
  // Formato de celda de Excel; sin él la columna es texto.
  formato?: string
  // Marca las columnas de dinero, las únicas que se suman al final.
  total?: boolean
  valor: (f: FacturaExportable) => string | number | Date
}

// Cada columna declara de dónde sale su valor: así el encabezado, el ancho y el
// dato no se pueden desincronizar al agregar o mover una columna.
const COLUMNAS: ColumnaReporte[] = [
  { titulo: 'Fecha de facturación', ancho: 20, formato: FORMATO_FECHA, valor: (f: FacturaExportable) => f.fecha_facturacion },
  { titulo: 'Cliente', ancho: 28, valor: (f: FacturaExportable) => f.clientes.nombre },
  { titulo: 'Cédula', ancho: 16, valor: (f: FacturaExportable) => f.clientes.cedula ?? SIN_DATO },
  { titulo: 'Paquete', ancho: 26, valor: (f: FacturaExportable) => f.paquetes.nombre },
  { titulo: 'Categoría', ancho: 18, valor: (f: FacturaExportable) => f.paquetes.categorias.nombre },
  { titulo: 'Noches', ancho: 10, valor: (f: FacturaExportable) => f.noches ?? '' },
  { titulo: 'Tarifa por noche', ancho: 16, formato: FORMATO_MONEDA, valor: (f: FacturaExportable) => numero(f.precio_noche, '') },
  { titulo: 'Precio base', ancho: 14, formato: FORMATO_MONEDA, total: true, valor: (f: FacturaExportable) => numero(f.precio_base) },
  { titulo: 'Descuento', ancho: 14, formato: FORMATO_MONEDA, total: true, valor: (f: FacturaExportable) => numero(f.descuento_monto) },
  { titulo: 'Monto cobrado', ancho: 16, formato: FORMATO_MONEDA, total: true, valor: (f: FacturaExportable) => numero(f.monto) },
  { titulo: 'Origen', ancho: 18, valor: (f: FacturaExportable) => f.origen ?? SIN_DATO },
  { titulo: 'Comisión', ancho: 14, formato: FORMATO_MONEDA, total: true, valor: (f: FacturaExportable) => numero(f.comision_monto) },
  { titulo: 'Neto del negocio', ancho: 18, formato: FORMATO_MONEDA, total: true, valor: (f: FacturaExportable) => numero(f.monto_neto) },
  { titulo: 'Próximo pago', ancho: 16, formato: FORMATO_FECHA, valor: (f: FacturaExportable) => f.fecha_proximo_pago ?? PAGO_UNICO },
  { titulo: 'Registrado por', ancho: 22, valor: (f: FacturaExportable) => f.usuarios?.nombre ?? SIN_DATO },
]

// Los Decimal de Prisma llegan como objeto: en la celda tienen que ser números
// para que Excel pueda sumarlos.
function numero(valor: unknown, siVacio: number | string = 0): number | string {
  if (valor === null || valor === undefined) return siVacio
  const n = Number(valor)
  return Number.isFinite(n) ? n : siVacio
}

const FILA_TITULO = 1
const FILA_PERIODO = 2
const FILA_ENCABEZADO = 4

/**
 * Arma el libro de Excel del reporte de facturación: título, período, una fila
 * por factura y una fila de totales. Devuelve el archivo como buffer listo para
 * enviarse en la respuesta.
 */
export async function generarExcelFacturas(
  facturas: FacturaExportable[],
  periodo: string
): Promise<Buffer> {
  const libro = new ExcelJS.Workbook()
  libro.created = new Date()
  const hoja = libro.addWorksheet(HOJA)

  hoja.columns = COLUMNAS.map((c) => ({ width: c.ancho }))

  const titulo = hoja.getRow(FILA_TITULO)
  titulo.getCell(1).value = TITULO
  titulo.getCell(1).font = { bold: true, size: 14 }

  hoja.getRow(FILA_PERIODO).getCell(1).value = periodo

  const encabezado = hoja.getRow(FILA_ENCABEZADO)
  encabezado.values = COLUMNAS.map((c) => c.titulo)
  encabezado.font = { bold: true }
  encabezado.eachCell((celda) => {
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
    celda.border = { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } }
  })

  for (const factura of facturas) {
    const fila = hoja.addRow(COLUMNAS.map((c) => c.valor(factura)))
    COLUMNAS.forEach((c, i) => {
      if (c.formato) fila.getCell(i + 1).numFmt = c.formato
    })
  }

  // Fila de totales: solo en las columnas de dinero. Se escribe como fórmula
  // SUM para que siga cuadrando si en Excel se borran filas a mano.
  const primeraFila = FILA_ENCABEZADO + 1
  const ultimaFila = FILA_ENCABEZADO + facturas.length
  const filaTotales = hoja.getRow(ultimaFila + 1)
  filaTotales.getCell(1).value = TOTALES
  filaTotales.font = { bold: true }

  COLUMNAS.forEach((c, i) => {
    if (!c.total) return
    const celda = filaTotales.getCell(i + 1)
    const letra = celda.address.replace(/\d+/g, '')
    // Sin filas no hay rango que sumar: se deja el total en cero.
    celda.value = facturas.length
      ? { formula: `SUM(${letra}${primeraFila}:${letra}${ultimaFila})`, date1904: false }
      : 0
    celda.numFmt = FORMATO_MONEDA
  })

  // Filtros en los encabezados y encabezados fijos al desplazarse.
  hoja.autoFilter = {
    from: { row: FILA_ENCABEZADO, column: 1 },
    to: { row: Math.max(ultimaFila, FILA_ENCABEZADO), column: COLUMNAS.length },
  }
  hoja.views = [{ state: 'frozen', ySplit: FILA_ENCABEZADO }]

  return Buffer.from(await libro.xlsx.writeBuffer())
}
