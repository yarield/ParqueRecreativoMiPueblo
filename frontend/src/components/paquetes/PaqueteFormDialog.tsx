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
    defaultValues: { estado: 'activo', duracion_unidad: 'dias', precio: null, precio_abierto: false, cobro_por_noche: false },
  })

  const precioAbierto = watch('precio_abierto')
  const porNoche = watch('cobro_por_noche')
  // Los tres modos son excluyentes, así que se manejan como un solo selector.
  const modo = porNoche ? 'noche' : precioAbierto ? 'abierto' : 'fijo'

  function cambiarModo(valor: string) {
    setValue('precio_abierto', valor === 'abierto')
    setValue('cobro_por_noche', valor === 'noche')
    // La duración de una estadía la fija cada factura (las noches), así que el
    // paquete no la usa: se guarda un valor válido para no bloquear el submit.
    if (valor === 'noche') setValue('duracion_dias', 1)
  }

  // Cambiar el modo de precio no reescribe el histórico: las facturas ya
  // emitidas guardan su propio precio_base. Se avisa igual para evitar dudas.
  const modoCambiado =
    !!paquete && (precioAbierto !== paquete.precio_abierto || porNoche !== paquete.cobro_por_noche)

  const ayudaModo = porNoche
    ? PAQUETES_LABELS.porNocheAyuda
    : precioAbierto
      ? PAQUETES_LABELS.precioAbiertoAyuda
      : PAQUETES_LABELS.precioFijoAyuda

  const etiquetaPrecio = porNoche
    ? PAQUETES_LABELS.tarifaNoche
    : precioAbierto
      ? PAQUETES_LABELS.precioReferencia
      : PAQUETES_LABELS.precio

  useEffect(() => {
    if (!open) return
    setFormError(null)
    if (paquete) {
      reset({
        nombre: paquete.nombre,
        precio: paquete.precio != null ? parseFloat(paquete.precio) : null,
        precio_abierto: paquete.precio_abierto,
        cobro_por_noche: paquete.cobro_por_noche,
        categoria_id: paquete.categoria_id,
        duracion_dias: paquete.duracion_dias,
        duracion_unidad: paquete.duracion_unidad,
        estado: paquete.estado,
      })
    } else {
      reset({
        estado: 'activo',
        categoria_id: 0,
        duracion_unidad: 'dias',
        precio: null,
        precio_abierto: false,
        cobro_por_noche: false,
      })
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
      {/* sm: es necesario: la clase base del componente trae sm:max-w-sm. */}
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
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

          <div className="space-y-1">
            <Label>{PAQUETES_LABELS.modoPrecio}</Label>
            <Select value={modo} onValueChange={cambiarModo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fijo">{PAQUETES_LABELS.precioFijo}</SelectItem>
                <SelectItem value="abierto">{PAQUETES_LABELS.precioAbierto}</SelectItem>
                <SelectItem value="noche">{PAQUETES_LABELS.porNoche}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{ayudaModo}</p>
            {modoCambiado && (
              <p className="text-xs text-amber-600">{PAQUETES_MESSAGES.cambioModoPrecio}</p>
            )}
          </div>

          {/* En modo por noche la duración no aplica: la estadía la definen las
              noches de cada factura, así que el precio ocupa la fila entera. */}
          <div className={porNoche ? '' : 'grid grid-cols-2 gap-4'}>
            <div className="space-y-1">
              <Label>{etiquetaPrecio}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('precio', { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
              />
              {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
            </div>

            {!porNoche && (
              <div className="space-y-1">
                <Label>{PAQUETES_LABELS.duracion}</Label>
                <Input type="number" min="1" {...register('duracion_dias')} />
                {errors.duracion_dias && <p className="text-xs text-red-500">{errors.duracion_dias.message}</p>}
              </div>
            )}
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
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? PAQUETES_MESSAGES.guardando : PAQUETES_MESSAGES.guardar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
