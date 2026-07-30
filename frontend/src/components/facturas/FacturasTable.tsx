import { Button } from '@/components/ui/button'
import { FACTURAS_LABELS, FACTURAS_MESSAGES } from '@/constants/facturas.constants'
import { formatearFecha } from '@/lib/date'
import type { FacturasTableProps } from './facturas.types'

export default function FacturasTable({ facturas, onEdit, onDelete }: FacturasTableProps) {
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
            <th className="px-4 py-3 text-right">{FACTURAS_LABELS.descuentoTotal}</th>
            <th className="px-4 py-3 text-right">{FACTURAS_LABELS.monto}</th>
            <th className="px-4 py-3 text-right">{FACTURAS_LABELS.comision}</th>
            <th className="px-4 py-3 text-right">{FACTURAS_LABELS.montoNeto}</th>
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
              <td className="px-4 py-3 text-right text-gray-600">
                {parseFloat(f.descuento_monto) > 0 ? parseFloat(f.descuento_monto).toFixed(2) : '—'}
              </td>
              <td className="px-4 py-3 text-right">{parseFloat(f.monto).toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-gray-600">
                {parseFloat(f.comision_monto) > 0 ? (
                  <span title={f.origen ?? undefined}>−{parseFloat(f.comision_monto).toFixed(2)}</span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-right font-medium">{parseFloat(f.monto_neto).toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-600">
                {formatearFecha(f.fecha_facturacion)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {f.fecha_proximo_pago
                  ? formatearFecha(f.fecha_proximo_pago)
                  : FACTURAS_LABELS.pagoUnico}
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
