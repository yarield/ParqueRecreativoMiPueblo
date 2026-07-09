import type { Categoria } from '@/types/categorias'
import type { CategoriaFormData } from '@/schemas/categorias.schema'

export interface CategoriaDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  categoria: Categoria | null
}

export interface CategoriaFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoriaFormData) => Promise<void>
  categoria?: Categoria
}

export interface CategoriasTableProps {
  categorias: Categoria[]
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
}
