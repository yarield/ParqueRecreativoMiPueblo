import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useCliente } from '@/hooks/useClientes'
import { CLIENTES_LABELS } from '@/constants/clientes.constants'
import type { Cliente } from '@/types/clientes'

interface Props {
  open: boolean
  onClose: () => void
  cliente: Cliente | null
}

export default function ClienteHistorialDialog({ open, onClose, cliente }: Props) {
  const { data, isLoading } = useCliente(cliente?.id ?? null)

  const hoy = new Date()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {CLIENTES_LABELS.historial} — {cliente?.nombre}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center text-gray-400 py-6">Cargando...</p>
        ) : !data || data.facturas.length === 0 ? (
          <p className="text-center text-gray-500 py-6">{CLIENTES_LABELS.sinFacturas}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border mt-2">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Paquete</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3 text-left">Facturado</th>
                  <th className="px-4 py-3 text-left">Próximo pago</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.facturas.map((f) => {
                  const vencido = new Date(f.fecha_proximo_pago) < hoy
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{f.paquetes.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{f.paquetes.categorias.nombre}</td>
                      <td className="px-4 py-3 text-right">${parseFloat(f.monto).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(f.fecha_facturacion).toLocaleDateString('es-VE')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(f.fecha_proximo_pago).toLocaleDateString('es-VE')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={vencido ? 'destructive' : 'default'}>
                          {vencido ? 'Vencido' : 'Al día'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
