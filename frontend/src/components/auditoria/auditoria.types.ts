import type { AuditoriaEvento } from '@/types/auditoria'

export interface AuditoriaTableProps {
  eventos: AuditoriaEvento[]
  onVerDetalle: (evento: AuditoriaEvento) => void
}

export interface AuditoriaDetalleDialogProps {
  open: boolean
  onClose: () => void
  evento: AuditoriaEvento | null
}
