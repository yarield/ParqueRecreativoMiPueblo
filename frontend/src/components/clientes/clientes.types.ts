import type { Cliente } from '@/types/clientes'
import type { ClienteFormData } from '@/schemas/clientes.schema'

export interface ClienteDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  cliente: Cliente | null
}

export interface ClienteFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ClienteFormData) => Promise<void>
  cliente?: Cliente
}

export interface ClienteHistorialDialogProps {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
}

export interface ClientesTableProps {
  clientes: Cliente[]
  onEdit: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
  onToggleEstado: (cliente: Cliente) => void
  onVerHistorial: (cliente: Cliente) => void
}
