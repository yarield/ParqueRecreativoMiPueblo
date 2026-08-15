import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PaquetesTable from '@/components/paquetes/PaquetesTable'
import PaqueteFormDialog from '@/components/paquetes/PaqueteFormDialog'
import PaqueteDeleteDialog from '@/components/paquetes/PaqueteDeleteDialog'
import CategoriasTable from '@/components/categorias/CategoriasTable'
import CategoriaFormDialog from '@/components/categorias/CategoriaFormDialog'
import CategoriaDeleteDialog from '@/components/categorias/CategoriaDeleteDialog'
import Paginacion from '@/components/common/Paginacion'
import { usePaquetes, useCreatePaquete, useUpdatePaquete, useDeletePaquete } from '@/hooks/usePaquetes'
import { usePaginacion } from '@/hooks/usePaginacion'
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '@/hooks/useCategorias'
import { PAQUETES_LABELS } from '@/constants/paquetes.constants'
import { CATEGORIAS_LABELS } from '@/constants/categorias.constants'
import type { Paquete } from '@/types/paquetes'
import type { Categoria } from '@/types/categorias'
import type { PaqueteFormData } from '@/schemas/paquetes.schema'
import type { CategoriaFormData } from '@/schemas/categorias.schema'

export default function PaquetesPage() {
  const { data: paquetes = [], isLoading: loadingPaquetes } = usePaquetes()
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias()

  const createPaquete = useCreatePaquete()
  const updatePaquete = useUpdatePaquete()
  const deletePaquete = useDeletePaquete()
  const createCategoria = useCreateCategoria()
  const updateCategoria = useUpdateCategoria()
  const deleteCategoria = useDeleteCategoria()

  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  const [paqueteEditar, setPaqueteEditar] = useState<Paquete | null>(null)
  const [paqueteEliminar, setPaqueteEliminar] = useState<Paquete | null>(null)
  const [paqueteFormOpen, setPaqueteFormOpen] = useState(false)

  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null)
  const [categoriaEliminar, setCategoriaEliminar] = useState<Categoria | null>(null)
  const [categoriaFormOpen, setCategoriaFormOpen] = useState(false)

  const paquetesFiltrados = useMemo(() => {
    return paquetes.filter((p) => {
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria = filtroCategoria === 'todos' || String(p.categoria_id) === filtroCategoria
      const coincideEstado = filtroEstado === 'todos' || p.estado === filtroEstado
      return coincideNombre && coincideCategoria && coincideEstado
    })
  }, [paquetes, busqueda, filtroCategoria, filtroEstado])

  const { items: paquetesPagina, control: paginacionPaquetes } = usePaginacion(paquetesFiltrados, [
    busqueda,
    filtroCategoria,
    filtroEstado,
  ])
  // Las categorías no tienen filtros: solo se parten en páginas.
  const { items: categoriasPagina, control: paginacionCategorias } = usePaginacion(categorias)

  async function handleSubmitPaquete(data: PaqueteFormData) {
    if (paqueteEditar) {
      await updatePaquete.mutateAsync({ id: paqueteEditar.id, data })
    } else {
      await createPaquete.mutateAsync(data)
    }
  }

  async function handleEliminarPaquete() {
    if (paqueteEliminar) await deletePaquete.mutateAsync(paqueteEliminar.id)
  }

  async function handleToggleEstadoPaquete(paquete: Paquete) {
    const nuevoEstado = paquete.estado === 'activo' ? 'inactivo' : 'activo'
    await updatePaquete.mutateAsync({ id: paquete.id, data: { estado: nuevoEstado } })
  }

  async function handleSubmitCategoria(data: CategoriaFormData) {
    if (categoriaEditar) {
      await updateCategoria.mutateAsync({ id: categoriaEditar.id, data })
    } else {
      await createCategoria.mutateAsync(data)
    }
  }

  async function handleEliminarCategoria() {
    if (categoriaEliminar) await deleteCategoria.mutateAsync(categoriaEliminar.id)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{PAQUETES_LABELS.titulo}</h2>

      <Tabs defaultValue="paquetes">
        <TabsList>
          <TabsTrigger value="paquetes">{PAQUETES_LABELS.tabPaquetes}</TabsTrigger>
          <TabsTrigger value="categorias">{PAQUETES_LABELS.tabCategorias}</TabsTrigger>
        </TabsList>

        <TabsContent value="paquetes" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Input
                className="w-56"
                placeholder={PAQUETES_LABELS.buscar}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{PAQUETES_LABELS.todasCategorias}</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{PAQUETES_LABELS.todos}</SelectItem>
                  <SelectItem value="activo">{PAQUETES_LABELS.activo}</SelectItem>
                  <SelectItem value="inactivo">{PAQUETES_LABELS.inactivo}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => { setPaqueteEditar(null); setPaqueteFormOpen(true) }}>
              {PAQUETES_LABELS.agregar}
            </Button>
          </div>

          {loadingPaquetes ? (
            <p className="text-center text-gray-400 py-8">Cargando...</p>
          ) : (
            <>
              <PaquetesTable
                paquetes={paquetesPagina}
                onEdit={(p) => { setPaqueteEditar(p); setPaqueteFormOpen(true) }}
                onDelete={setPaqueteEliminar}
                onToggleEstado={handleToggleEstadoPaquete}
              />
              <Paginacion control={paginacionPaquetes} />
            </>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => { setCategoriaEditar(null); setCategoriaFormOpen(true) }}>
              {CATEGORIAS_LABELS.agregar}
            </Button>
          </div>

          {loadingCategorias ? (
            <p className="text-center text-gray-400 py-8">Cargando...</p>
          ) : (
            <>
              <CategoriasTable
                categorias={categoriasPagina}
                onEdit={(c) => { setCategoriaEditar(c); setCategoriaFormOpen(true) }}
                onDelete={setCategoriaEliminar}
              />
              <Paginacion control={paginacionCategorias} />
            </>
          )}
        </TabsContent>
      </Tabs>

      <PaqueteFormDialog
        open={paqueteFormOpen}
        onClose={() => setPaqueteFormOpen(false)}
        onSubmit={handleSubmitPaquete}
        paquete={paqueteEditar ?? undefined}
        categorias={categorias}
      />
      <PaqueteDeleteDialog
        open={!!paqueteEliminar}
        onClose={() => setPaqueteEliminar(null)}
        onConfirm={handleEliminarPaquete}
        paquete={paqueteEliminar}
      />
      <CategoriaFormDialog
        open={categoriaFormOpen}
        onClose={() => setCategoriaFormOpen(false)}
        onSubmit={handleSubmitCategoria}
        categoria={categoriaEditar ?? undefined}
      />
      <CategoriaDeleteDialog
        open={!!categoriaEliminar}
        onClose={() => setCategoriaEliminar(null)}
        onConfirm={handleEliminarCategoria}
        categoria={categoriaEliminar}
      />
    </div>
  )
}
