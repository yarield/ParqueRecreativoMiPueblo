import { Button } from '@/components/ui/button'
import { FACTURAS_LABELS, FACTURAS_MESSAGES } from '@/constants/facturas.constants'
import type { Factura } from '@/types/facturas'

interface Props {
  facturas: Factura[]
  onEdit: (factura: Factura) => void
  onDelete: (factura: Factura) => void
}

export default function FacturasTable({ facturas, onEdit, onDelete }: Props) {
  if (facturas.length === 0) {
    return <p className="text-center text-gray-500 py-8">{FACTURAS_LABELS.sinFacturas}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">{FACTURAS_LABELS.cliente}</th>
            <th className="px-4 py-3 text-left">{FACTURAS_LABELS.cedula}</th>
            <th className="px-4 py-3 text-left">{FACTURAS_LABELS.paquete}</th>
            <th className="px-4 py-3 text-left">{FACTURAS_LABELS.categoria}</th>
            <th className="px-4 py-3 text-right">{FACTURAS_LABELS.monto}</th>
            <th className="px-4 py-3 text-left">{FACTURAS_LABELS.fechaFacturacion}</th>
            <th className="px-4 py-3 text-left">{FACTURAS_LABELS.fechaProximoPago}</th>
            <th className="px-4 py-3 text-right">{FACTURAS_LABELS.acciones}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {facturas.map((f) => (
            <tr key={f.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{f.clientes.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{f.clientes.cedula}</td>
              <td className="px-4 py-3 text-gray-600">{f.paquetes.nombre}</td>
              <td className="px-4 py-3 text-gray-600">{f.paquetes.categorias.nombre}</td>
              <td className="px-4 py-3 text-right">{parseFloat(f.monto).toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(f.fecha_facturacion).toLocaleDateString('es-VE')}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(f.fecha_proximo_pago).toLocaleDateString('es-VE')}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(f)}>
                    {FACTURAS_MESSAGES.editarBtn}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(f)}>
                    {FACTURAS_MESSAGES.eliminarBtn}
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
