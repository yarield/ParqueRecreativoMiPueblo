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
import { FACTURAS_LABELS, FACTURAS_MESSAGES, FACTURAS_MAX_SUGERENCIAS_CLIENTE } from '@/constants/facturas.constants'
import { calcularProximoPago } from '@/lib/date'
import { calcularMontoDescuento } from '@/lib/descuentos'
import type { DescuentoTipo } from '@/lib/descuentos'
import type { FacturaFormData } from '@/schemas/facturas.schema'
import type { FacturaFormDialogProps } from './facturas.types'

// Normaliza para comparar: minúsculas, sin tildes y sin separadores. Así
// "S-2011-1222", "s20111222" o un pegado con espacios coinciden, y "juan perez"
// encuentra a "Juan Pérez".
const normalizar = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')

// Texto con el que se muestra un cliente ya elegido en el campo de búsqueda.
const etiquetaCliente = (c: { nombre: string; cedula: string | null }) =>
  c.cedula ? `${c.nombre} · ${c.cedula}` : c.nombre

export default function FacturaFormDialog({ open, onClose, onSubmit, factura, clientes, paquetes, categorias, facturas }: FacturaFormDialogProps) {
  const isEditing = !!factura
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [descuentoManualTipo, setDescuentoManualTipo] = useState<DescuentoTipo>('porcentaje')
  const [descuentoManualValor, setDescuentoManualValor] = useState(0)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema) as Resolver<FacturaFormData>,
    defaultValues: { fecha_facturacion: new Date().toISOString().slice(0, 10) },
  })

  // El cliente se busca por nombre o cédula: los menores de edad se registran
  // sin cédula y no habría forma de facturarles si solo se buscara por ella.
  const terminoCliente = normalizar(clienteBusqueda)
  const clientesCoincidentes = terminoCliente
    ? clientes
        .filter(
          (c) =>
            normalizar(c.nombre).includes(terminoCliente) ||
            (c.cedula ? normalizar(c.cedula).includes(terminoCliente) : false)
        )
        .slice(0, FACTURAS_MAX_SUGERENCIAS_CLIENTE)
    : []

  // Se conserva el atajo de escribir la cédula completa: si coincide exacta con
  // una, el cliente queda seleccionado sin tener que elegir de la lista.
  const coincidenciaExactaCedula = terminoCliente
    ? clientes.find((c) => c.cedula && normalizar(c.cedula) === terminoCliente)
    : undefined

  const clienteSeleccionado = clientes.find((c) => c.id === Number(watch('cliente_id')))

  function seleccionarCliente(c: { id: number; nombre: string; cedula: string | null }) {
    setValue('cliente_id', c.id)
    setClienteBusqueda(etiquetaCliente(c))
    setMostrarSugerencias(false)
  }

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
  const facturasCliente = clienteSeleccionado && paqueteSeleccionado
    ? facturas
        .filter(
          (f) =>
            f.cliente_id === clienteSeleccionado.id &&
            f.paquete_id === paqueteSeleccionado.id &&
            f.id !== factura?.id &&
            // Las de pago único no forman ciclo, así que no anclan nada.
            f.fecha_proximo_pago !== null
        )
        .map((f) => ({
          fecha_facturacion: f.fecha_facturacion.slice(0, 10),
          fecha_proximo_pago: f.fecha_proximo_pago!.slice(0, 10),
        }))
    : []
  // Clave estable para las dependencias del efecto (evita recalcular en cada render).
  const facturasClienteKey = facturasCliente
    .map((f) => `${f.fecha_facturacion}:${f.fecha_proximo_pago}`)
    .join('|')

  // En un paquete de precio abierto el precio base lo escribe el usuario en la
  // factura (el del paquete, si lo hay, solo sirve de valor inicial); en uno de
  // precio fijo se toma del paquete y el campo queda bloqueado.
  const esPrecioAbierto = paqueteSeleccionado?.precio_abierto ?? false
  const precioPaquete = paqueteSeleccionado?.precio != null ? parseFloat(paqueteSeleccionado.precio) : 0
  const precioBase = esPrecioAbierto ? Number(watch('precio_base')) || 0 : precioPaquete

  // Desglose del monto: precio base menos el descuento de esta factura, que se
  // resuelve a un monto absoluto y no puede superar el precio base.
  const descuentoMonto = calcularMontoDescuento(precioBase, descuentoManualTipo, Number(descuentoManualValor) || 0)
  const montoFinal = Number((precioBase - descuentoMonto).toFixed(2))

  // La comisión del canal se calcula sobre lo que paga el cliente y no lo
  // reduce: solo separa la parte que se lleva el canal del neto del negocio.
  const comisionTipo = watch('comision_tipo') ?? 'porcentaje'
  const comisionMonto = Number(
    calcularMontoDescuento(montoFinal, comisionTipo, Number(watch('comision_valor')) || 0).toFixed(2)
  )
  const montoNeto = Number((montoFinal - comisionMonto).toFixed(2))

  // Escribir la cédula completa selecciona al cliente directamente. Elegirlo de
  // la lista de sugerencias es el otro camino y lo hace seleccionarCliente().
  const idExactoPorCedula = coincidenciaExactaCedula?.id
  useEffect(() => {
    if (idExactoPorCedula) setValue('cliente_id', idExactoPorCedula)
  }, [idExactoPorCedula, setValue])

  // Sincronizar los campos calculados con el formulario para que pasen
  // validación. precio_base se excluye en modo abierto: ahí lo controla el
  // propio input y sobrescribirlo borraría lo que el usuario escribe.
  useEffect(() => {
    if (!esPrecioAbierto) setValue('precio_base', precioBase)
    setValue('descuento_monto', Number(descuentoMonto.toFixed(2)))
    setValue('monto', montoFinal)
  }, [esPrecioAbierto, precioBase, descuentoMonto, montoFinal, setValue])

  // Auto-calcular fecha_proximo_pago al cambiar paquete o fecha. Un paquete de
  // precio abierto se cobra una sola vez: se limpia la fecha en vez de calcularla.
  useEffect(() => {
    if (esPrecioAbierto) {
      setValue('fecha_proximo_pago', undefined)
    } else if (paqueteSeleccionado && fechaFacturacion) {
      setValue('fecha_proximo_pago', calcularProximoPago(fechaFacturacion, paqueteSeleccionado, facturasCliente))
    }
    // facturasCliente se representa por facturasClienteKey en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esPrecioAbierto, paqueteSeleccionado?.id, fechaFacturacion, facturasClienteKey, setValue])

  // Poblar/limpiar el form cada vez que se abre el diálogo. Depender de `open`
  // asegura que al reabrir para "Nueva factura" no queden datos de la anterior.
  useEffect(() => {
    if (!open) return
    if (factura) {
      const cliente = clientes.find((c) => c.id === factura.cliente_id)
      setClienteBusqueda(cliente ? etiquetaCliente(cliente) : '')
      setMostrarSugerencias(false)
      setCategoriaFiltro(String(factura.paquetes.categoria_id))
      // El descuento guardado ya es un monto absoluto: se reedita como tal.
      const base = parseFloat(factura.precio_base)
      setDescuentoManualTipo('monto')
      setDescuentoManualValor(parseFloat(factura.descuento_monto))
      reset({
        cliente_id: factura.cliente_id,
        paquete_id: factura.paquete_id,
        fecha_facturacion: factura.fecha_facturacion.slice(0, 10),
        fecha_proximo_pago: factura.fecha_proximo_pago?.slice(0, 10),
        precio_base: base,
        descuento_monto: parseFloat(factura.descuento_monto),
        monto: parseFloat(factura.monto),
        origen: factura.origen ?? '',
        comision_tipo: factura.comision_tipo,
        comision_valor: parseFloat(factura.comision_valor),
      })
    } else {
      setClienteBusqueda('')
      setMostrarSugerencias(false)
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
        origen: '',
        comision_tipo: 'porcentaje',
        comision_valor: 0,
      })
    }
  }, [factura, clientes, reset, open])

  async function handleFormSubmit(data: FacturaFormData) {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* El ancho lleva el prefijo sm: porque la clase base del componente trae
          sm:max-w-sm, que de otro modo gana en pantallas ≥640px. */}
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? FACTURAS_LABELS.editar : FACTURAS_LABELS.agregar}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          {/* Cliente, categoría y paquete en una sola fila */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 relative">
              <Label>{FACTURAS_LABELS.cliente}</Label>
              <Input
                placeholder={FACTURAS_LABELS.clienteBusquedaPlaceholder}
                value={clienteBusqueda}
                onChange={(e) => {
                  // Al reescribir se suelta el cliente elegido: así no queda una
                  // factura asignada a alguien que ya no es el del texto.
                  setValue('cliente_id', 0)
                  setClienteBusqueda(e.target.value)
                  setMostrarSugerencias(true)
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() => setMostrarSugerencias(false)}
              />
              {clienteBusqueda && (
                <p className={`text-xs truncate ${clienteSeleccionado ? 'text-green-600' : 'text-red-500'}`}>
                  {clienteSeleccionado
                    ? `✓ ${etiquetaCliente(clienteSeleccionado)}`
                    : FACTURAS_LABELS.clienteNoEncontrado}
                </p>
              )}
              {errors.cliente_id && <p className="text-xs text-red-500">{errors.cliente_id.message}</p>}

              {mostrarSugerencias && !clienteSeleccionado && clientesCoincidentes.length > 0 && (
                <ul className="absolute top-full left-0 z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border bg-white shadow-md">
                  {clientesCoincidentes.map((c) => (
                    <li key={c.id}>
                      {/* onMouseDown y no onClick: el clic dispara el blur del
                          input antes que el click y cerraría la lista primero. */}
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-100"
                        onMouseDown={() => seleccionarCliente(c)}
                      >
                        <span className="block truncate text-sm">{c.nombre}</span>
                        <span className="block truncate text-xs text-gray-500">
                          {c.cedula ?? FACTURAS_LABELS.sinCedula}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

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
                  const p = paquetes.find((x) => x.id === id)
                  // En un paquete de precio abierto se arranca desde su precio
                  // de referencia (o vacío si no tiene) para poder ajustarlo.
                  if (p?.precio_abierto) {
                    setValue('precio_base', p.precio != null ? parseFloat(p.precio) : 0)
                  }
                  // Si la categoría no está seleccionada, adoptar la del paquete elegido.
                  if (categoriaFiltro === 'todos' && p) {
                    setCategoriaFiltro(String(p.categoria_id))
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

          {/* Fechas y precio base */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.fechaFacturacion}</Label>
              <Input type="date" {...register('fecha_facturacion')} />
              {errors.fecha_facturacion && <p className="text-xs text-red-500">{errors.fecha_facturacion.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.fechaProximoPago}</Label>
              {esPrecioAbierto ? (
                <Input value={FACTURAS_LABELS.pagoUnico} readOnly className="bg-gray-50 text-gray-500" />
              ) : (
                <Input type="date" {...register('fecha_proximo_pago')} />
              )}
              {errors.fecha_proximo_pago && <p className="text-xs text-red-500">{errors.fecha_proximo_pago.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>{FACTURAS_LABELS.precioBase}</Label>
              {esPrecioAbierto ? (
                <Input type="number" step="0.01" min="0" {...register('precio_base')} />
              ) : (
                <Input type="number" value={precioBase.toFixed(2)} readOnly className="bg-gray-50" />
              )}
              {errors.precio_base && <p className="text-xs text-red-500">{errors.precio_base.message}</p>}
            </div>
          </div>

          {esPrecioAbierto && (
            <p className="text-xs text-gray-500 -mt-2">
              {FACTURAS_LABELS.precioAbiertoAyuda}
              {precioPaquete > 0 && ` ${FACTURAS_LABELS.precioReferencia}: ${precioPaquete.toFixed(2)}`}
              {` ${FACTURAS_LABELS.pagoUnicoAyuda}`}
            </p>
          )}

          {/* Descuento adicional al cliente y comisión del canal, lado a lado:
              el primero baja el total del cliente, la segunda solo el neto. */}
          <div className="grid grid-cols-2 gap-3 items-start">
            <fieldset className="rounded-md border border-gray-200 p-3 space-y-2">
              <legend className="px-1 text-xs font-medium text-gray-600">{FACTURAS_LABELS.descuento}</legend>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{FACTURAS_LABELS.descuentoTipo}</Label>
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
                  <Label className="text-xs text-gray-500">{FACTURAS_LABELS.comisionValor}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={descuentoManualTipo === 'porcentaje' ? 100 : undefined}
                    value={descuentoManualValor}
                    onChange={(e) => setDescuentoManualValor(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-md border border-gray-200 p-3 space-y-2">
              <legend className="px-1 text-xs font-medium text-gray-600">{FACTURAS_LABELS.comision}</legend>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{FACTURAS_LABELS.comisionTipo}</Label>
                  <Select
                    value={comisionTipo}
                    onValueChange={(v) => setValue('comision_tipo', v as DescuentoTipo)}
                  >
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
                  <Label className="text-xs text-gray-500">{FACTURAS_LABELS.comisionValor}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={comisionTipo === 'porcentaje' ? 100 : undefined}
                    {...register('comision_valor')}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">{FACTURAS_LABELS.origen}</Label>
                <Input placeholder={FACTURAS_LABELS.origenPlaceholder} {...register('origen')} />
              </div>
            </fieldset>
          </div>
          {errors.comision_valor && <p className="text-xs text-red-500 -mt-2">{errors.comision_valor.message}</p>}

          {/* Desglose: reemplaza los campos de solo lectura que antes ocupaban
              una fila cada uno. Las líneas en cero se omiten. */}
          <div className="rounded-md bg-gray-50 px-3 py-2 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>{FACTURAS_LABELS.precioBase}</span>
              <span>{precioBase.toFixed(2)}</span>
            </div>
            {descuentoMonto > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{FACTURAS_LABELS.descuento}</span>
                <span>−{descuentoMonto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 font-medium text-gray-900">
              <span>{FACTURAS_LABELS.totalCliente}</span>
              <span>{montoFinal.toFixed(2)}</span>
            </div>
            {comisionMonto > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>{FACTURAS_LABELS.comision}</span>
                  <span>−{comisionMonto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium text-gray-900">
                  <span>{FACTURAS_LABELS.montoNeto}</span>
                  <span>{montoNeto.toFixed(2)}</span>
                </div>
              </>
            )}
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
