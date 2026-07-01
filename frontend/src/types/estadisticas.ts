export interface Resumen {
  totalClientes: number
  clientesActivos: number
  clientesInactivos: number
  tasaCancelacion: number
  totalFacturas: number
  totalGanancias: number
}

export interface ClientesPorMes {
  mes: string
  cantidad: number
}

export interface PaqueteVendido {
  nombre: string
  total: number
}

export interface GananciasPorMes {
  mes: string
  total: number
}
