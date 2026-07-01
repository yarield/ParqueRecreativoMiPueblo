import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { categoriaSchema } from '@/schemas/categorias.schema'
import { CATEGORIAS_LABELS, CATEGORIAS_MESSAGES } from '@/constants/categorias.constants'
import type { CategoriaFormData } from '@/schemas/categorias.schema'
import type { Categoria } from '@/types/categorias'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoriaFormData) => Promise<void>
  categoria?: Categoria
}

export default function CategoriaFormDialog({ open, onClose, onSubmit, categoria }: Props) {
  const isEditing = !!categoria

  const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
  })

  useEffect(() => {
    if (categoria) {
      reset({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' })
    } else {
      reset({ nombre: '', descripcion: '' })
    }
  }, [categoria, reset])

  async function handleFormSubmit(data: CategoriaFormData) {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? CATEGORIAS_LABELS.editar : CATEGORIAS_LABELS.agregar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>{CATEGORIAS_LABELS.nombre}</Label>
            <Input placeholder="Natación adultos..." {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>{CATEGORIAS_LABELS.descripcion}</Label>
            <Input placeholder={CATEGORIAS_LABELS.descripcionPlaceholder} {...register('descripcion')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {CATEGORIAS_MESSAGES.cancelar}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? CATEGORIAS_MESSAGES.guardando : CATEGORIAS_MESSAGES.guardar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
