import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CATEGORIAS_LABELS, CATEGORIAS_MESSAGES } from '@/constants/categorias.constants'
import type { Categoria } from '@/types/categorias'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  categoria: Categoria | null
}

export default function CategoriaDeleteDialog({ open, onClose, onConfirm, categoria }: Props) {
  async function handleConfirm() {
    await onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{CATEGORIAS_LABELS.eliminar}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {CATEGORIAS_MESSAGES.confirmarEliminar}{' '}
          <span className="font-semibold">{categoria?.nombre}</span>?{' '}
          {CATEGORIAS_MESSAGES.accionIrreversible}
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>
            {CATEGORIAS_MESSAGES.cancelar}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {CATEGORIAS_MESSAGES.eliminarBtn}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
