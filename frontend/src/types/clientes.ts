export interface Cliente {
  id: number
  nombre: string
  // Opcional: los clientes menores de edad pueden no tenerla.
  cedula: string | null
  telefono: string | null
  fecha_inicio: string
  observaciones: string | null
  estado: 'activo' | 'inactivo'
}

export interface FacturaDeCliente {
  id: number
  fecha_facturacion: string
  fecha_proximo_pago: string | null
  monto: string
  paquetes: {
    nombre: string
    precio: string
    categorias: { nombre: string }
  }
}

export interface ClienteConFacturas extends Cliente {
  facturas: FacturaDeCliente[]
}

export interface ClienteEnMora {
  id: number
  nombre: string
  cedula: string | null
  telefono: string | null
  fecha_proximo_pago: string
  paquete_nombre: string
  dias_atraso: number
}
