import type { Categoria } from './categorias'

export interface FacturaCliente {
  id: number
  nombre: string
  cedula: string
  estado: string
}

export interface FacturaPaquete {
  id: number
  nombre: string
  precio: string
  duracion_dias: number
  categoria_id: number
  descuento_tipo: 'porcentaje' | 'monto'
  descuento_valor: string
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
  fecha_proximo_pago: string
  precio_base: string
  descuento_monto: string
  monto: string
  clientes: FacturaCliente
  paquetes: FacturaPaquete
  usuarios: FacturaUsuario | null
}
