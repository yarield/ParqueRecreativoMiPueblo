import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { paqueteSchema } from '@/schemas/paquetes.schema'
import { PAQUETES_LABELS, PAQUETES_MESSAGES } from '@/constants/paquetes.constants'
import type { PaqueteFormData } from '@/schemas/paquetes.schema'
import type { Paquete } from '@/types/paquetes'
import type { Categoria } from '@/types/categorias'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: PaqueteFormData) => Promise<void>
  paquete?: Paquete
  categorias: Categoria[]
}

export default function PaqueteFormDialog({ open, onClose, onSubmit, paquete, categorias }: Props) {
  const isEditing = !!paquete

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<PaqueteFormData>({
    resolver: zodResolver(paqueteSchema) as Resolver<PaqueteFormData>,
    defaultValues: { estado: 'activo' },
  })

  useEffect(() => {
    if (paquete) {
      reset({
        nombre: paquete.nombre,
        precio: parseFloat(paquete.precio),
        categoria_id: paquete.categoria_id,
        duracion_dias: paquete.duracion_dias,
        estado: paquete.estado,
      })
    } else {
      reset({ estado: 'activo', categoria_id: 0 })
    }
  }, [paquete, reset])

  async function handleFormSubmit(data: PaqueteFormData) {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? PAQUETES_LABELS.editar : PAQUETES_LABELS.agregar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>{PAQUETES_LABELS.nombre}</Label>
            <Input placeholder="Paquete mensual..." {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.precio}</Label>
              <Input type="number" step="0.01" min="0" {...register('precio')} />
              {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.duracion}</Label>
              <Input type="number" min="1" {...register('duracion_dias')} />
              {errors.duracion_dias && <p className="text-xs text-red-500">{errors.duracion_dias.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.categoria}</Label>
              <Select
                value={String(watch('categoria_id') || '')}
                onValueChange={(v) => setValue('categoria_id', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={PAQUETES_LABELS.seleccionarCategoria} />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria_id && <p className="text-xs text-red-500">{errors.categoria_id.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.estado}</Label>
              <Select value={watch('estado')} onValueChange={(v) => setValue('estado', v as 'activo' | 'inactivo')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">{PAQUETES_LABELS.activo}</SelectItem>
                  <SelectItem value="inactivo">{PAQUETES_LABELS.inactivo}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {PAQUETES_MESSAGES.cancelar}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? PAQUETES_MESSAGES.guardando : PAQUETES_MESSAGES.guardar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
