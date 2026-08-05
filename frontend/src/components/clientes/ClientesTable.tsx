import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CLIENTES_LABELS, CLIENTES_MESSAGES } from '@/constants/clientes.constants'
import { formatearFecha } from '@/lib/date'
import type { ClientesTableProps } from './clientes.types'

export default function ClientesTable({ clientes, onEdit, onDelete, onToggleEstado, onVerHistorial }: ClientesTableProps) {
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
              <td className="px-4 py-3 text-gray-600">
                {cliente.cedula ?? (
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    {CLIENTES_LABELS.sinCedula}
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{cliente.telefono ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">
                {formatearFecha(cliente.fecha_inicio)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={cliente.estado === 'activo' ? 'default' : 'secondary'}>
                  {cliente.estado === 'activo' ? CLIENTES_LABELS.activo : CLIENTES_LABELS.inactivo}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        {CLIENTES_MESSAGES.editarBtn}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => onEdit(cliente)}>
                        {CLIENTES_MESSAGES.editarBtn}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onVerHistorial(cliente)}>
                        {CLIENTES_MESSAGES.historialBtn}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onToggleEstado(cliente)}>
                        {cliente.estado === 'activo' ? CLIENTES_LABELS.inactivo : CLIENTES_LABELS.activo}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(cliente)}>
                        {CLIENTES_MESSAGES.eliminarBtn}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
