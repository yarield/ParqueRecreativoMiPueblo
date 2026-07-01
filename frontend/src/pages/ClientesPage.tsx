import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClientesTable from '@/components/clientes/ClientesTable'
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog'
import ClienteDeleteDialog from '@/components/clientes/ClienteDeleteDialog'
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '@/hooks/useClientes'
import { CLIENTES_LABELS } from '@/constants/clientes.constants'
import type { Cliente } from '@/types/clientes'
import type { ClienteFormData } from '@/schemas/clientes.schema'

export default function ClientesPage() {
  const { data: clientes = [], isLoading } = useClientes()
  const createCliente = useCreateCliente()
  const updateCliente = useUpdateCliente()
  const deleteCliente = useDeleteCliente()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null)
  const [clienteEliminar, setClienteEliminar] = useState<Cliente | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const coincideBusqueda =
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.cedula.toLowerCase().includes(busqueda.toLowerCase())
      const coincideEstado = filtroEstado === 'todos' || c.estado === filtroEstado
      return coincideBusqueda && coincideEstado
    })
  }, [clientes, busqueda, filtroEstado])

  function abrirCrear() {
    setClienteEditar(null)
    setFormOpen(true)
  }

  function abrirEditar(cliente: Cliente) {
    setClienteEditar(cliente)
    setFormOpen(true)
  }

  async function handleSubmitForm(data: ClienteFormData) {
    if (clienteEditar) {
      await updateCliente.mutateAsync({ id: clienteEditar.id, data })
    } else {
      await createCliente.mutateAsync(data)
    }
  }

  async function handleEliminar() {
    if (clienteEliminar) {
      await deleteCliente.mutateAsync(clienteEliminar.id)
    }
  }

  async function handleToggleEstado(cliente: Cliente) {
    const nuevoEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo'
    await updateCliente.mutateAsync({ id: cliente.id, data: { estado: nuevoEstado } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{CLIENTES_LABELS.titulo}</h2>
        <Button onClick={abrirCrear}>{CLIENTES_LABELS.agregar}</Button>
      </div>

      <div className="flex gap-3">
        <Input
          className="max-w-sm"
          placeholder={CLIENTES_LABELS.buscar}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{CLIENTES_LABELS.todos}</SelectItem>
            <SelectItem value="activo">{CLIENTES_LABELS.activo}</SelectItem>
            <SelectItem value="inactivo">{CLIENTES_LABELS.inactivo}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : (
        <ClientesTable
          clientes={clientesFiltrados}
          onEdit={abrirEditar}
          onDelete={(c) => setClienteEliminar(c)}
          onToggleEstado={handleToggleEstado}
        />
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
    </div>
  )
}
