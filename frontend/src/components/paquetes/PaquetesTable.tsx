import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PAQUETES_LABELS, PAQUETES_MESSAGES } from '@/constants/paquetes.constants'
import type { PaquetesTableProps } from './paquetes.types'

export default function PaquetesTable({ paquetes, onEdit, onDelete, onToggleEstado }: PaquetesTableProps) {
  if (paquetes.length === 0) {
    return <p className="text-center text-gray-500 py-8">{PAQUETES_LABELS.sinPaquetes}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">{PAQUETES_LABELS.nombre}</th>
            <th className="px-4 py-3 text-left">{PAQUETES_LABELS.categoria}</th>
            <th className="px-4 py-3 text-right">{PAQUETES_LABELS.precio}</th>
            <th className="px-4 py-3 text-right">{PAQUETES_LABELS.duracion}</th>
            <th className="px-4 py-3 text-left">{PAQUETES_LABELS.estado}</th>
            <th className="px-4 py-3 text-right">{PAQUETES_LABELS.acciones}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {paquetes.map((paquete) => (
            <tr key={paquete.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{paquete.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{paquete.categorias.nombre}</td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  {paquete.precio != null ? parseFloat(paquete.precio).toFixed(2) : PAQUETES_LABELS.sinPrecio}
                  {paquete.precio_abierto && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      {PAQUETES_LABELS.precioAbiertoBadge}
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-gray-600">{paquete.duracion_dias}d</td>
              <td className="px-4 py-3">
                <Badge variant={paquete.estado === 'activo' ? 'default' : 'secondary'}>
                  {paquete.estado === 'activo' ? PAQUETES_LABELS.activo : PAQUETES_LABELS.inactivo}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onToggleEstado(paquete)}>
                    {paquete.estado === 'activo' ? PAQUETES_LABELS.inactivo : PAQUETES_LABELS.activo}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEdit(paquete)}>
                    {PAQUETES_MESSAGES.editarBtn}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(paquete)}>
                    {PAQUETES_MESSAGES.eliminarBtn}
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
