import { Button } from '@/components/ui/button'
import { CATEGORIAS_LABELS, CATEGORIAS_MESSAGES } from '@/constants/categorias.constants'
import type { Categoria } from '@/types/categorias'

interface Props {
  categorias: Categoria[]
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
}

export default function CategoriasTable({ categorias, onEdit, onDelete }: Props) {
  if (categorias.length === 0) {
    return <p className="text-center text-gray-500 py-8">{CATEGORIAS_LABELS.sinCategorias}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">{CATEGORIAS_LABELS.nombre}</th>
            <th className="px-4 py-3 text-left">{CATEGORIAS_LABELS.descripcion}</th>
            <th className="px-4 py-3 text-right">{CATEGORIAS_LABELS.acciones}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {categorias.map((categoria) => (
            <tr key={categoria.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{categoria.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{categoria.descripcion ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(categoria)}>
                    {CATEGORIAS_MESSAGES.editarBtn}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(categoria)}>
                    {CATEGORIAS_MESSAGES.eliminarBtn}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
