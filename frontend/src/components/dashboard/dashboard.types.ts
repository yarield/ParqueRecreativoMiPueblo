import type { ClienteEnMora } from '@/types/clientes'

export interface ClientesEnMoraTableProps {
  clientes: ClienteEnMora[]
  onMarcarInactivo: (cliente: ClienteEnMora) => void
}
