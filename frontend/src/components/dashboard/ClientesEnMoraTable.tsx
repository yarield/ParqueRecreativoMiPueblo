import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DASHBOARD_LABELS } from '@/constants/dashboard.constants'
import { formatearFecha } from '@/lib/date'
import type { ClientesEnMoraTableProps } from './dashboard.types'

export default function ClientesEnMoraTable({ clientes, onMarcarInactivo }: ClientesEnMoraTableProps) {
  if (clientes.length === 0) {
    return <p className="text-center text-gray-500 py-8">{DASHBOARD_LABELS.sinMora}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">{DASHBOARD_LABELS.nombre}</th>
            <th className="px-4 py-3 text-left">{DASHBOARD_LABELS.cedula}</th>
            <th className="px-4 py-3 text-left">{DASHBOARD_LABELS.telefono}</th>
            <th className="px-4 py-3 text-left">{DASHBOARD_LABELS.paquete}</th>
            <th className="px-4 py-3 text-left">{DASHBOARD_LABELS.proximoPago}</th>
            <th className="px-4 py-3 text-left">{DASHBOARD_LABELS.diasAtraso}</th>
            <th className="px-4 py-3 text-right">{DASHBOARD_LABELS.acciones}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{cliente.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{cliente.cedula}</td>
              <td className="px-4 py-3 text-gray-600">{cliente.telefono ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{cliente.paquete_nombre}</td>
              <td className="px-4 py-3 text-gray-600">
                {formatearFecha(cliente.fecha_proximo_pago)}
              </td>
              <td className="px-4 py-3">
                <Badge variant="destructive">{cliente.dias_atraso}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <Button size="sm" variant="destructive" onClick={() => onMarcarInactivo(cliente)}>
                    {DASHBOARD_LABELS.marcarInactivo}
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
