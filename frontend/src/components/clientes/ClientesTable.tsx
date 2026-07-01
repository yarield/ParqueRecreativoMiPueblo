import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CLIENTES_LABELS, CLIENTES_MESSAGES } from '@/constants/clientes.constants'
import type { Cliente } from '@/types/clientes'

interface Props {
  clientes: Cliente[]
  onEdit: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
  onToggleEstado: (cliente: Cliente) => void
}

export default function ClientesTable({ clientes, onEdit, onDelete, onToggleEstado }: Props) {
  if (clientes.length === 0) {
    return <p className="text-center text-gray-500 py-8">{CLIENTES_LABELS.sinClientes}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">{CLIENTES_LABELS.nombre}</th>
            <th className="px-4 py-3 text-left">{CLIENTES_LABELS.cedula}</th>
            <th className="px-4 py-3 text-left">{CLIENTES_LABELS.telefono}</th>
            <th className="px-4 py-3 text-left">{CLIENTES_LABELS.fechaInicio}</th>
            <th className="px-4 py-3 text-left">{CLIENTES_LABELS.estado}</th>
            <th className="px-4 py-3 text-right">{CLIENTES_LABELS.acciones}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{cliente.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{cliente.cedula}</td>
              <td className="px-4 py-3 text-gray-600">{cliente.telefono ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(cliente.fecha_inicio).toLocaleDateString('es-VE')}
              </td>
              <td className="px-4 py-3">
                <Badge variant={cliente.estado === 'activo' ? 'default' : 'secondary'}>
                  {cliente.estado === 'activo' ? CLIENTES_LABELS.activo : CLIENTES_LABELS.inactivo}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onToggleEstado(cliente)}>
                    {cliente.estado === 'activo' ? CLIENTES_LABELS.inactivo : CLIENTES_LABELS.activo}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEdit(cliente)}>
                    {CLIENTES_MESSAGES.editarBtn}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(cliente)}>
                    {CLIENTES_MESSAGES.eliminarBtn}
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
