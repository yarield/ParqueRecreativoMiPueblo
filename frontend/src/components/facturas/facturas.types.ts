import type { Factura } from '@/types/facturas'
import type { FacturaFormData } from '@/schemas/facturas.schema'
import type { Cliente } from '@/types/clientes'
import type { Paquete } from '@/types/paquetes'
import type { Categoria } from '@/types/categorias'

export interface FacturaDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  factura: Factura | null
}

export interface FacturaFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: FacturaFormData) => Promise<void>
  factura?: Factura
  clientes: Cliente[]
  paquetes: Paquete[]
  categorias: Categoria[]
  facturas: Factura[]
}

export interface FacturasTableProps {
  facturas: Factura[]
  onEdit: (factura: Factura) => void
  onDelete: (factura: Factura) => void
}
