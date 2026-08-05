import type { Categoria } from './categorias'

export interface FacturaCliente {
  id: number
  nombre: string
  cedula: string | null
  estado: string
}

export interface FacturaPaquete {
  id: number
  nombre: string
  precio: string | null
  precio_abierto: boolean
  duracion_dias: number
  categoria_id: number
  categorias: Categoria
}

export interface FacturaUsuario {
  id: number
  nombre: string
  email: string
}

export interface Factura {
  id: number
  cliente_id: number
  paquete_id: number
  usuario_id: number | null
  fecha_facturacion: string
  // null = pago único (paquete de precio abierto), sin ciclo siguiente.
  fecha_proximo_pago: string | null
  precio_base: string
  descuento_monto: string
  monto: string
  origen: string | null
  comision_tipo: 'porcentaje' | 'monto'
  comision_valor: string
  comision_monto: string
  monto_neto: string
  clientes: FacturaCliente
  paquetes: FacturaPaquete
  usuarios: FacturaUsuario | null
}
