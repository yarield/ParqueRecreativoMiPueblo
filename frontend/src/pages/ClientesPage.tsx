import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClientesTable from '@/components/clientes/ClientesTable'
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog'
import ClienteDeleteDialog from '@/components/clientes/ClienteDeleteDialog'
import ClienteHistorialDialog from '@/components/clientes/ClienteHistorialDialog'
import Paginacion from '@/components/common/Paginacion'
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '@/hooks/useClientes'
import { usePaginacion } from '@/hooks/usePaginacion'
import { CLIENTES_LABELS, CLIENTES_MESSAGES } from '@/constants/clientes.constants'
import type { Cliente } from '@/types/clientes'
import type { ClienteFormData } from '@/schemas/clientes.schema'

export default function ClientesPage() {
  const { data: clientes = [], isLoading } = useClientes()
  const createCliente = useCreateCliente()
  const updateCliente = useUpdateCliente()
  const deleteCliente = useDeleteCliente()

  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [filtroCedula, setFiltroCedula] = useState<'todas' | 'con' | 'sin'>('todas')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null)
  const [clienteEliminar, setClienteEliminar] = useState<Cliente | null>(null)
  const [clienteHistorial, setClienteHistorial] = useState<Cliente | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const termino = busqueda.toLowerCase()
      const coincideBusqueda =
        c.nombre.toLowerCase().includes(termino) ||
        (c.cedula?.toLowerCase().includes(termino) ?? false)

      const coincideEstado = filtroEstado === 'todos' || c.estado === filtroEstado

      const coincideCedula =
        filtroCedula === 'todas' || (filtroCedula === 'con' ? !!c.cedula : !c.cedula)

      const fechaInicio = c.fecha_inicio.slice(0, 10)
      const coincideFechaDesde = !filtroFechaDesde || fechaInicio >= filtroFechaDesde
      const coincideFechaHasta = !filtroFechaHasta || fechaInicio <= filtroFechaHasta

      return coincideBusqueda && coincideEstado && coincideCedula && coincideFechaDesde && coincideFechaHasta
    })
  }, [clientes, busqueda, filtroEstado, filtroCedula, filtroFechaDesde, filtroFechaHasta])

  const { items: clientesPagina, control: paginacion } = usePaginacion(clientesFiltrados, [
    busqueda,
    filtroEstado,
    filtroCedula,
    filtroFechaDesde,
    filtroFechaHasta,
  ])

  function handleBuscar() {
    setBusqueda(busquedaInput)
  }

  function handleLimpiarFiltros() {
    setBusquedaInput('')
    setBusqueda('')
    setFiltroEstado('todos')
    setFiltroCedula('todas')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
  }

  async function handleSubmitForm(data: ClienteFormData) {
    if (clienteEditar) {
      await updateCliente.mutateAsync({ id: clienteEditar.id, data })
    } else {
      await createCliente.mutateAsync(data)
    }
  }

  async function handleEliminar() {
    if (clienteEliminar) await deleteCliente.mutateAsync(clienteEliminar.id)
  }

  async function handleToggleEstado(cliente: Cliente) {
    const nuevoEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo'
    await updateCliente.mutateAsync({ id: cliente.id, data: { estado: nuevoEstado } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{CLIENTES_LABELS.titulo}</h2>
        <Button onClick={() => { setClienteEditar(null); setFormOpen(true) }}>
          {CLIENTES_LABELS.agregar}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="w-56"
          placeholder={CLIENTES_LABELS.buscar}
          value={busquedaInput}
          onChange={(e) => setBusquedaInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar() }}
        />
        <Button variant="outline" onClick={handleBuscar}>
          {CLIENTES_MESSAGES.buscarBtn}
        </Button>
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{CLIENTES_LABELS.todos}</SelectItem>
            <SelectItem value="activo">{CLIENTES_LABELS.activo}</SelectItem>
            <SelectItem value="inactivo">{CLIENTES_LABELS.inactivo}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCedula} onValueChange={(v) => setFiltroCedula(v as typeof filtroCedula)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{CLIENTES_LABELS.cedulaTodas}</SelectItem>
            <SelectItem value="con">{CLIENTES_LABELS.conCedula}</SelectItem>
            <SelectItem value="sin">{CLIENTES_LABELS.sinCedula}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{CLIENTES_LABELS.filtrarFechaDesde}</span>
          <Input
            type="date"
            className="w-40"
            value={filtroFechaDesde}
            onChange={(e) => setFiltroFechaDesde(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{CLIENTES_LABELS.filtrarFechaHasta}</span>
          <Input
            type="date"
            className="w-40"
            value={filtroFechaHasta}
            onChange={(e) => setFiltroFechaHasta(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleLimpiarFiltros}>
          {CLIENTES_MESSAGES.limpiarFiltrosBtn}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : (
        <>
          <ClientesTable
            clientes={clientesPagina}
            onEdit={(c) => { setClienteEditar(c); setFormOpen(true) }}
            onDelete={setClienteEliminar}
            onToggleEstado={handleToggleEstado}
            onVerHistorial={setClienteHistorial}
          />
          <Paginacion control={paginacion} />
        </>
      )}

      <ClienteFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitForm}
        cliente={clienteEditar ?? undefined}
      />

      <ClienteDeleteDialog
        open={!!clienteEliminar}
        onClose={() => setClienteEliminar(null)}
        onConfirm={handleEliminar}
        cliente={clienteEliminar}
      />

      <ClienteHistorialDialog
        open={!!clienteHistorial}
        onClose={() => setClienteHistorial(null)}
        cliente={clienteHistorial}
      />
    </div>
  )
}
