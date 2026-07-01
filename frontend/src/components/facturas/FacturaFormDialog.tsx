import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { facturaSchema } from '@/schemas/facturas.schema'
import { FACTURAS_LABELS, FACTURAS_MESSAGES } from '@/constants/facturas.constants'
import type { FacturaFormData } from '@/schemas/facturas.schema'
import type { Factura } from '@/types/facturas'
import type { Cliente } from '@/types/clientes'
import type { Paquete } from '@/types/paquetes'
import type { Categoria } from '@/types/categorias'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: FacturaFormData) => Promise<void>
  factura?: Factura
  clientes: Cliente[]
  paquetes: Paquete[]
  categorias: Categoria[]
}

function sumarDias(fechaStr: string, dias: number): string {
  const fecha = new Date(fechaStr + 'T00:00:00')
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

export default function FacturaFormDialog({ open, onClose, onSubmit, factura, clientes, paquetes, categorias }: Props) {
  const isEditing = !!factura
  const [cedulaInput, setCedulaInput] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema) as Resolver<FacturaFormData>,
    defaultValues: { fecha_facturacion: new Date().toISOString().slice(0, 10) },
  })

  const clienteEncontrado = clientes.find(
    (c) => c.cedula.toLowerCase() === cedulaInput.toLowerCase().trim()
  )

  const paquetesFiltrados = categoriaFiltro === 'todos'
    ? paquetes
    : paquetes.filter((p) => String(p.categoria_id) === categoriaFiltro)

  const paqueteId = watch('paquete_id')
  const fechaFacturacion = watch('fecha_facturacion')
  const paqueteSeleccionado = paquetes.find((p) => p.id === Number(paqueteId))

  // Asignar cliente_id al encontrar el cliente por cédula
  useEffect(() => {
    setValue('cliente_id', clienteEncontrado?.id ?? 0)
  }, [clienteEncontrado?.id, setValue])

  // Auto-calcular monto y fecha_proximo_pago al cambiar paquete o fecha
  useEffect(() => {
    if (paqueteSeleccionado && fechaFacturacion) {
      setValue('monto', parseFloat(paqueteSeleccionado.precio))
      setValue('fecha_proximo_pago', sumarDias(fechaFacturacion, paqueteSeleccionado.duracion_dias))
    }
  }, [paqueteSeleccionado?.id, fechaFacturacion, setValue])

  // Poblar form al editar
  useEffect(() => {
    if (factura) {
      const cliente = clientes.find((c) => c.id === factura.cliente_id)
      setCedulaInput(cliente?.cedula ?? '')
      setCategoriaFiltro(String(factura.paquetes.categoria_id))
      reset({
        cliente_id: factura.cliente_id,
        paquete_id: factura.paquete_id,
        fecha_facturacion: factura.fecha_facturacion.slice(0, 10),
        fecha_proximo_pago: factura.fecha_proximo_pago.slice(0, 10),
        monto: parseFloat(factura.monto),
      })
    } else {
      setCedulaInput('')
      setCategoriaFiltro('todos')
      reset({ fecha_facturacion: new Date().toISOString().slice(0, 10), cliente_id: 0, paquete_id: 0, monto: 0 })
    }
  }, [factura, clientes, reset])

  async function handleFormSubmit(data: FacturaFormData) {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? FACTURAS_LABELS.editar : FACTURAS_LABELS.agregar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          {/* Búsqueda por cédula */}
          <div className="space-y-1">
            <Label>{FACTURAS_LABELS.cedula}</Label>
            <Input
              placeholder={FACTURAS_LABELS.cedulaPlaceholder}
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value)}
            />
            {cedulaInput && (
              <p className={`text-xs ${clienteEncontrado ? 'text-green-600' : 'text-red-500'}`}>
                {clienteEncontrado ? `✓ ${clienteEncontrado.nombre}` : FACTURAS_LABELS.clienteNoEncontrado}
              </p>
            )}
            {errors.cliente_id && <p className="text-xs text-red-500">{errors.cliente_id.message}</p>}
          </div>

          {/* Selección de categoría y paquete */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.categoria}</Label>
              <Select value={categoriaFiltro} onValueChange={(v) => { setCategoriaFiltro(v); setValue('paquete_id', 0) }}>
                <SelectTrigger>
                  <SelectValue placeholder={FACTURAS_LABELS.seleccionarCategoria} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{FACTURAS_LABELS.todasCategorias}</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.paquete}</Label>
              <Select
                value={String(watch('paquete_id') || '')}
                onValueChange={(v) => setValue('paquete_id', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={FACTURAS_LABELS.seleccionarPaquete} />
                </SelectTrigger>
                <SelectContent>
                  {paquetesFiltrados.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paquete_id && <p className="text-xs text-red-500">{errors.paquete_id.message}</p>}
            </div>
          </div>

          {/* Fechas y monto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.fechaFacturacion}</Label>
              <Input type="date" {...register('fecha_facturacion')} />
              {errors.fecha_facturacion && <p className="text-xs text-red-500">{errors.fecha_facturacion.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.fechaProximoPago}</Label>
              <Input type="date" {...register('fecha_proximo_pago')} />
              {errors.fecha_proximo_pago && <p className="text-xs text-red-500">{errors.fecha_proximo_pago.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>{FACTURAS_LABELS.monto}</Label>
            <Input type="number" step="0.01" min="0" {...register('monto')} />
            {errors.monto && <p className="text-xs text-red-500">{errors.monto.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {FACTURAS_MESSAGES.cancelar}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? FACTURAS_MESSAGES.guardando : FACTURAS_MESSAGES.guardar}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
