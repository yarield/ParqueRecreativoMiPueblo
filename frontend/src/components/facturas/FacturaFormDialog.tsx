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
import { calcularProximoPago } from '@/lib/date'
import { calcularMontoDescuento } from '@/lib/descuentos'
import type { DescuentoTipo } from '@/lib/descuentos'
import type { FacturaFormData } from '@/schemas/facturas.schema'
import type { FacturaFormDialogProps } from './facturas.types'

export default function FacturaFormDialog({ open, onClose, onSubmit, factura, clientes, paquetes, categorias, facturas }: FacturaFormDialogProps) {
  const isEditing = !!factura
  const [cedulaInput, setCedulaInput] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [descuentoManualTipo, setDescuentoManualTipo] = useState<DescuentoTipo>('porcentaje')
  const [descuentoManualValor, setDescuentoManualValor] = useState(0)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema) as Resolver<FacturaFormData>,
    defaultValues: { fecha_facturacion: new Date().toISOString().slice(0, 10) },
  })

  // Normaliza cédulas para comparar: minúsculas y sin separadores ni caracteres
  // invisibles. Así "S-2011-1222", "s20111222" o un pegado con espacios coinciden.
  const normalizarCedula = (c: string) => c.toLowerCase().replace(/[^a-z0-9]/g, '')
  const clienteEncontrado = cedulaInput.trim()
    ? clientes.find((c) => normalizarCedula(c.cedula) === normalizarCedula(cedulaInput))
    : undefined

  const paqueteId = watch('paquete_id')
  const fechaFacturacion = watch('fecha_facturacion')

  // Solo se pueden facturar paquetes activos. Se conserva el paquete ya
  // seleccionado (aunque esté inactivo) para no romper la edición de una
  // factura vieja cuyo paquete se desactivó después.
  const paquetesDisponibles = paquetes.filter(
    (p) => p.estado === 'activo' || p.id === Number(paqueteId)
  )

  const paquetesFiltrados = categoriaFiltro === 'todos'
    ? paquetesDisponibles
    : paquetesDisponibles.filter((p) => String(p.categoria_id) === categoriaFiltro)

  const paqueteSeleccionado = paquetes.find((p) => p.id === Number(paqueteId))

  // Historial de ciclos de ESTE paquete para este cliente (fecha de facturación
  // + próximo pago). Se filtra por paquete porque cada paquete es una membresía
  // independiente: un cliente puede tener varios a la vez con ciclos distintos.
  // Sirve para anclar el próximo pago a su primera factura de ese paquete y
  // detectar reingresos tras una pausa. Se excluye la factura que se edita.
  const facturasCliente = clienteEncontrado && paqueteSeleccionado
    ? facturas
        .filter(
          (f) =>
            f.cliente_id === clienteEncontrado.id &&
            f.paquete_id === paqueteSeleccionado.id &&
            f.id !== factura?.id
        )
        .map((f) => ({
          fecha_facturacion: f.fecha_facturacion.slice(0, 10),
          fecha_proximo_pago: f.fecha_proximo_pago.slice(0, 10),
        }))
    : []
  // Clave estable para las dependencias del efecto (evita recalcular en cada render).
  const facturasClienteKey = facturasCliente
    .map((f) => `${f.fecha_facturacion}:${f.fecha_proximo_pago}`)
    .join('|')

  // Desglose del monto: precio base del paquete, deducción automática del
  // paquete (monto fijo o porcentaje) y descuento manual adicional. Ambos se
  // resuelven a un monto absoluto y su suma no puede superar el precio base.
  const precioBase = paqueteSeleccionado ? parseFloat(paqueteSeleccionado.precio) : 0
  const deduccionPaquete = paqueteSeleccionado
    ? calcularMontoDescuento(precioBase, paqueteSeleccionado.descuento_tipo, parseFloat(paqueteSeleccionado.descuento_valor))
    : 0
  const descuentoManualMonto = calcularMontoDescuento(precioBase, descuentoManualTipo, Number(descuentoManualValor) || 0)
  const descuentoMonto = Math.min(precioBase, deduccionPaquete + descuentoManualMonto)
  const montoFinal = Number((precioBase - descuentoMonto).toFixed(2))

  // Asignar cliente_id al encontrar el cliente por cédula
  useEffect(() => {
    setValue('cliente_id', clienteEncontrado?.id ?? 0)
  }, [clienteEncontrado?.id, setValue])

  // Sincronizar los campos calculados con el formulario para que pasen validación
  useEffect(() => {
    setValue('precio_base', precioBase)
    setValue('descuento_monto', Number(descuentoMonto.toFixed(2)))
    setValue('monto', montoFinal)
  }, [precioBase, descuentoMonto, montoFinal, setValue])

  // Auto-calcular fecha_proximo_pago al cambiar paquete o fecha
  useEffect(() => {
    if (paqueteSeleccionado && fechaFacturacion) {
      setValue('fecha_proximo_pago', calcularProximoPago(fechaFacturacion, paqueteSeleccionado, facturasCliente))
    }
    // facturasCliente se representa por facturasClienteKey en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paqueteSeleccionado?.id, fechaFacturacion, facturasClienteKey, setValue])

  // Poblar/limpiar el form cada vez que se abre el diálogo. Depender de `open`
  // asegura que al reabrir para "Nueva factura" no queden datos de la anterior.
  useEffect(() => {
    if (!open) return
    if (factura) {
      const cliente = clientes.find((c) => c.id === factura.cliente_id)
      setCedulaInput(cliente?.cedula ?? '')
      setCategoriaFiltro(String(factura.paquetes.categoria_id))
      // El descuento manual es la parte del total que no proviene del paquete.
      // Se reconstruye como monto fijo a partir de lo guardado.
      const base = parseFloat(factura.precio_base)
      const deduccionPaq = calcularMontoDescuento(
        base,
        factura.paquetes.descuento_tipo,
        parseFloat(factura.paquetes.descuento_valor)
      )
      setDescuentoManualTipo('monto')
      setDescuentoManualValor(Math.max(0, parseFloat(factura.descuento_monto) - deduccionPaq))
      reset({
        cliente_id: factura.cliente_id,
        paquete_id: factura.paquete_id,
        fecha_facturacion: factura.fecha_facturacion.slice(0, 10),
        fecha_proximo_pago: factura.fecha_proximo_pago.slice(0, 10),
        precio_base: base,
        descuento_monto: parseFloat(factura.descuento_monto),
        monto: parseFloat(factura.monto),
      })
    } else {
      setCedulaInput('')
      setCategoriaFiltro('todos')
      setDescuentoManualTipo('porcentaje')
      setDescuentoManualValor(0)
      reset({
        fecha_facturacion: new Date().toISOString().slice(0, 10),
        cliente_id: 0,
        paquete_id: 0,
        precio_base: 0,
        descuento_monto: 0,
        monto: 0,
      })
    }
  }, [factura, clientes, reset, open])

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
                disabled={paquetesFiltrados.length === 0}
                onValueChange={(v) => {
                  const id = Number(v)
                  setValue('paquete_id', id)
                  // Si la categoría no está seleccionada, adoptar la del paquete elegido.
                  if (categoriaFiltro === 'todos') {
                    const p = paquetes.find((x) => x.id === id)
                    if (p) setCategoriaFiltro(String(p.categoria_id))
                  }
                }}
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
              {paquetesFiltrados.length === 0 && (
                <p className="text-xs text-gray-500">{FACTURAS_LABELS.sinPaquetesCategoria}</p>
              )}
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

          {/* Desglose de descuentos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.precioBase}</Label>
              <Input type="number" value={precioBase.toFixed(2)} readOnly className="bg-gray-50" />
            </div>

            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.deduccionPaquete}</Label>
              <Input value={deduccionPaquete.toFixed(2)} readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Descuento manual adicional (monto fijo o porcentaje) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.descuentoTipo}</Label>
              <Select value={descuentoManualTipo} onValueChange={(v) => setDescuentoManualTipo(v as DescuentoTipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porcentaje">{FACTURAS_LABELS.descuentoTipoPorcentaje}</SelectItem>
                  <SelectItem value="monto">{FACTURAS_LABELS.descuentoTipoMonto}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.descuento}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={descuentoManualValor}
                onChange={(e) => setDescuentoManualValor(e.target.value === '' ? 0 : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{FACTURAS_LABELS.monto}</Label>
            <Input type="number" value={montoFinal.toFixed(2)} readOnly className="bg-gray-50 font-medium" />
            <p className="text-xs text-gray-500">
              {FACTURAS_LABELS.descuentoTotal}: {descuentoMonto.toFixed(2)}
            </p>
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
