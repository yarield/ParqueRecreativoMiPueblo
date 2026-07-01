import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PAQUETES_LABELS, PAQUETES_MESSAGES } from '@/constants/paquetes.constants'
import type { Paquete } from '@/types/paquetes'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  paquete: Paquete | null
}

export default function PaqueteDeleteDialog({ open, onClose, onConfirm, paquete }: Props) {
  async function handleConfirm() {
    await onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{PAQUETES_LABELS.eliminar}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {PAQUETES_MESSAGES.confirmarEliminar}{' '}
          <span className="font-semibold">{paquete?.nombre}</span>?{' '}
          {PAQUETES_MESSAGES.accionIrreversible}
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>
            {PAQUETES_MESSAGES.cancelar}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {PAQUETES_MESSAGES.eliminarBtn}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
