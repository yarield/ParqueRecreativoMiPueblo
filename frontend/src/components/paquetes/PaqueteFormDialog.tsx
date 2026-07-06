import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import type { PaqueteFormDialogProps } from './paquetes.types'

export default function PaqueteFormDialog({ open, onClose, onSubmit, paquete, categorias }: PaqueteFormDialogProps) {
  const isEditing = !!paquete
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<PaqueteFormData>({
    resolver: zodResolver(paqueteSchema) as Resolver<PaqueteFormData>,
    defaultValues: { estado: 'activo', duracion_unidad: 'dias', descuento_tipo: 'porcentaje', descuento_valor: 0 },
  })

  useEffect(() => {
    if (!open) return
    setFormError(null)
    if (paquete) {
      reset({
        nombre: paquete.nombre,
        precio: parseFloat(paquete.precio),
        categoria_id: paquete.categoria_id,
        duracion_dias: paquete.duracion_dias,
        duracion_unidad: paquete.duracion_unidad,
        descuento_tipo: paquete.descuento_tipo,
        descuento_valor: parseFloat(paquete.descuento_valor),
        estado: paquete.estado,
      })
    } else {
      reset({ estado: 'activo', categoria_id: 0, duracion_unidad: 'dias', descuento_tipo: 'porcentaje', descuento_valor: 0 })
    }
  }, [paquete, reset, open])

  async function handleFormSubmit(data: PaqueteFormData) {
    setFormError(null)
    try {
      await onSubmit(data)
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : (isEditing ? PAQUETES_MESSAGES.errorActualizar : PAQUETES_MESSAGES.errorCrear))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? PAQUETES_LABELS.editar : PAQUETES_LABELS.agregar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          {formError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <Label>{PAQUETES_LABELS.nombre}</Label>
            <Input placeholder="Paquete mensual..." {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.duracionUnidad}</Label>
              <Select
                value={watch('duracion_unidad')}
                onValueChange={(v) => setValue('duracion_unidad', v as 'dias' | 'meses')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dias">{PAQUETES_LABELS.unidadDias}</SelectItem>
                  <SelectItem value="meses">{PAQUETES_LABELS.unidadMeses}</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.descuentoTipo}</Label>
              <Select
                value={watch('descuento_tipo')}
                onValueChange={(v) => setValue('descuento_tipo', v as 'porcentaje' | 'monto')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porcentaje">{PAQUETES_LABELS.descuentoTipoPorcentaje}</SelectItem>
                  <SelectItem value="monto">{PAQUETES_LABELS.descuentoTipoMonto}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{PAQUETES_LABELS.descuentoValor}</Label>
              <Input type="number" step="0.01" min="0" {...register('descuento_valor')} />
              {errors.descuento_valor && <p className="text-xs text-red-500">{errors.descuento_valor.message}</p>}
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-2">{PAQUETES_LABELS.descuentoAyuda}</p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {PAQUETES_MESSAGES.cancelar}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? PAQUETES_MESSAGES.guardando : PAQUETES_MESSAGES.guardar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
