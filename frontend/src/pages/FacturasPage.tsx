import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FacturasTable from '@/components/facturas/FacturasTable'
import FacturaFormDialog from '@/components/facturas/FacturaFormDialog'
import FacturaDeleteDialog from '@/components/facturas/FacturaDeleteDialog'
import { useFacturas, useCreateFactura, useUpdateFactura, useDeleteFactura } from '@/hooks/useFacturas'
import { useClientes } from '@/hooks/useClientes'
import { usePaquetes } from '@/hooks/usePaquetes'
import { useCategorias } from '@/hooks/useCategorias'
import { FACTURAS_LABELS } from '@/constants/facturas.constants'
import type { Factura } from '@/types/facturas'
import type { FacturaFormData } from '@/schemas/facturas.schema'

export default function FacturasPage() {
  const { data: facturas = [], isLoading } = useFacturas()
  const { data: clientes = [] } = useClientes()
  const { data: paquetes = [] } = usePaquetes()
  const { data: categorias = [] } = useCategorias()

  const createFactura = useCreateFactura()
  const updateFactura = useUpdateFactura()
  const deleteFactura = useDeleteFactura()

  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [filtroPaquete, setFiltroPaquete] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('')

  const [facturaEditar, setFacturaEditar] = useState<Factura | null>(null)
  const [facturaEliminar, setFacturaEliminar] = useState<Factura | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const paquetesFiltradosPorCategoria = useMemo(() =>
    filtroCategoria === 'todos'
      ? paquetes
      : paquetes.filter((p) => String(p.categoria_id) === filtroCategoria),
    [paquetes, filtroCategoria]
  )

  const facturasFiltradas = useMemo(() => {
    return facturas.filter((f) => {
      const coincideCliente =
        !busquedaCliente ||
        f.clientes.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        (f.clientes.cedula?.toLowerCase().includes(busquedaCliente.toLowerCase()) ?? false)

      const coincideCategoria =
        filtroCategoria === 'todos' ||
        String(f.paquetes.categoria_id) === filtroCategoria

      const coincidePaquete =
        filtroPaquete === 'todos' || String(f.paquete_id) === filtroPaquete

      const coincideFecha =
        !filtroFecha || f.fecha_proximo_pago?.slice(0, 10) === filtroFecha

      return coincideCliente && coincideCategoria && coincidePaquete && coincideFecha
    })
  }, [facturas, busquedaCliente, filtroCategoria, filtroPaquete, filtroFecha])

  function abrirCrear() {
    setFacturaEditar(null)
    setFormOpen(true)
  }

  async function handleSubmit(data: FacturaFormData) {
    if (facturaEditar) {
      await updateFactura.mutateAsync({ id: facturaEditar.id, data })
    } else {
      await createFactura.mutateAsync(data)
    }
  }

  async function handleEliminar() {
    if (facturaEliminar) await deleteFactura.mutateAsync(facturaEliminar.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{FACTURAS_LABELS.titulo}</h2>
        <Button onClick={abrirCrear}>{FACTURAS_LABELS.agregar}</Button>
      </div>

      {/* Filtros múltiples */}
      <div className="flex flex-wrap gap-3">
        <Input
          className="w-56"
          placeholder={FACTURAS_LABELS.buscarCliente}
          value={busquedaCliente}
          onChange={(e) => setBusquedaCliente(e.target.value)}
        />

        <Select value={filtroCategoria} onValueChange={(v) => { setFiltroCategoria(v); setFiltroPaquete('todos') }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{FACTURAS_LABELS.todasCategorias}</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroPaquete} onValueChange={setFiltroPaquete}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{FACTURAS_LABELS.todosPaquetes}</SelectItem>
            {paquetesFiltradosPorCategoria.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-44"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          title={FACTURAS_LABELS.filtrarFecha}
        />
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : (
        <FacturasTable
          facturas={facturasFiltradas}
          onEdit={(f) => { setFacturaEditar(f); setFormOpen(true) }}
          onDelete={setFacturaEliminar}
        />
      )}

      <FacturaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        factura={facturaEditar ?? undefined}
        clientes={clientes}
        paquetes={paquetes}
        categorias={categorias}
        facturas={facturas}
      />

      <FacturaDeleteDialog
        open={!!facturaEliminar}
        onClose={() => setFacturaEliminar(null)}
        onConfirm={handleEliminar}
        factura={facturaEliminar}
      />
    </div>
  )
}
