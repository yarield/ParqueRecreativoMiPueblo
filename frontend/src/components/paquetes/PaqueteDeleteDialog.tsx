import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PAQUETES_LABELS, PAQUETES_MESSAGES } from '@/constants/paquetes.constants'
import type { PaqueteDeleteDialogProps } from './paquetes.types'

export default function PaqueteDeleteDialog({ open, onClose, onConfirm, paquete }: PaqueteDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setError(null)
    onClose()
  }

  async function handleConfirm() {
    setError(null)
    try {
      await onConfirm()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : PAQUETES_MESSAGES.errorConFacturas)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{PAQUETES_LABELS.eliminar}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {PAQUETES_MESSAGES.confirmarEliminar}{' '}
          <span className="font-semibold">{paquete?.nombre}</span>?{' '}
          {PAQUETES_MESSAGES.accionIrreversible}
        </p>
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={handleClose}>
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
