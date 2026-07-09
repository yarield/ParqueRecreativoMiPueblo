import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CLIENTES_LABELS, CLIENTES_MESSAGES } from '@/constants/clientes.constants'
import type { ClienteDeleteDialogProps } from './clientes.types'

export default function ClienteDeleteDialog({ open, onClose, onConfirm, cliente }: ClienteDeleteDialogProps) {
  async function handleConfirm() {
    await onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{CLIENTES_LABELS.eliminar}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {CLIENTES_MESSAGES.confirmarEliminar}{' '}
          <span className="font-semibold">{cliente?.nombre}</span>?{' '}
          {CLIENTES_MESSAGES.accionIrreversible}
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>
            {CLIENTES_MESSAGES.cancelar}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {CLIENTES_MESSAGES.eliminarBtn}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
