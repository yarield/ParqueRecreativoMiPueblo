import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FACTURAS_LABELS, FACTURAS_MESSAGES } from '@/constants/facturas.constants'
import type { FacturaDeleteDialogProps } from './facturas.types'

export default function FacturaDeleteDialog({ open, onClose, onConfirm, factura }: FacturaDeleteDialogProps) {
  async function handleConfirm() {
    await onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{FACTURAS_LABELS.eliminar}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {FACTURAS_MESSAGES.confirmarEliminar}{' '}
          <span className="font-semibold">{factura?.clientes.nombre}</span>?{' '}
          {FACTURAS_MESSAGES.accionIrreversible}
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>{FACTURAS_MESSAGES.cancelar}</Button>
          <Button variant="destructive" onClick={handleConfirm}>{FACTURAS_MESSAGES.eliminarBtn}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
