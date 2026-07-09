import type { Paquete } from '@/types/paquetes'
import type { PaqueteFormData } from '@/schemas/paquetes.schema'
import type { Categoria } from '@/types/categorias'

export interface PaqueteDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  paquete: Paquete | null
}

export interface PaqueteFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PaqueteFormData) => Promise<void>
  paquete?: Paquete
  categorias: Categoria[]
}

export interface PaquetesTableProps {
  paquetes: Paquete[]
  onEdit: (paquete: Paquete) => void
  onDelete: (paquete: Paquete) => void
  onToggleEstado: (paquete: Paquete) => void
}
