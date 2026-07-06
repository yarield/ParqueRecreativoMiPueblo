import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CATEGORIAS_LABELS, CATEGORIAS_MESSAGES } from '@/constants/categorias.constants'
import type { CategoriaDeleteDialogProps } from './categorias.types'

export default function CategoriaDeleteDialog({ open, onClose, onConfirm, categoria }: CategoriaDeleteDialogProps) {
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
      setError(err instanceof Error ? err.message : CATEGORIAS_MESSAGES.errorConPaquetes)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{CATEGORIAS_LABELS.eliminar}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {CATEGORIAS_MESSAGES.confirmarEliminar}{' '}
          <span className="font-semibold">{categoria?.nombre}</span>?{' '}
          {CATEGORIAS_MESSAGES.accionIrreversible}
        </p>
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={handleClose}>
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
