import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clienteSchema } from '@/schemas/clientes.schema'
import { CLIENTES_LABELS, CLIENTES_MESSAGES } from '@/constants/clientes.constants'
import type { ClienteFormData } from '@/schemas/clientes.schema'
import type { Cliente } from '@/types/clientes'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: ClienteFormData) => Promise<void>
  cliente?: Cliente
}

export default function ClienteFormDialog({ open, onClose, onSubmit, cliente }: Props) {
  const isEditing = !!cliente

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { estado: 'activo' },
  })

  useEffect(() => {
    if (cliente) {
      reset({
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        telefono: cliente.telefono ?? '',
        fecha_inicio: cliente.fecha_inicio.slice(0, 10),
        observaciones: cliente.observaciones ?? '',
        estado: cliente.estado,
      })
    } else {
      reset({ estado: 'activo' })
    }
  }, [cliente, reset])

  async function handleFormSubmit(data: ClienteFormData) {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? CLIENTES_LABELS.editar : CLIENTES_LABELS.agregar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{CLIENTES_LABELS.nombre}</Label>
              <Input placeholder="Juan Pérez" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>{CLIENTES_LABELS.cedula}</Label>
              <Input placeholder="V-12345678" {...register('cedula')} />
              {errors.cedula && <p className="text-xs text-red-500">{errors.cedula.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{CLIENTES_LABELS.telefono}</Label>
              <Input placeholder={CLIENTES_LABELS.telefonoPlaceholder} {...register('telefono')} />
            </div>

            <div className="space-y-1">
              <Label>{CLIENTES_LABELS.fechaInicio}</Label>
              <Input type="date" {...register('fecha_inicio')} />
              {errors.fecha_inicio && <p className="text-xs text-red-500">{errors.fecha_inicio.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>{CLIENTES_LABELS.estado}</Label>
            <Select value={watch('estado')} onValueChange={(v) => setValue('estado', v as 'activo' | 'inactivo')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">{CLIENTES_LABELS.activo}</SelectItem>
                <SelectItem value="inactivo">{CLIENTES_LABELS.inactivo}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{CLIENTES_LABELS.observaciones}</Label>
            <Input placeholder={CLIENTES_LABELS.observacionesPlaceholder} {...register('observaciones')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {CLIENTES_MESSAGES.cancelar}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? CLIENTES_MESSAGES.guardando : CLIENTES_MESSAGES.guardar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
