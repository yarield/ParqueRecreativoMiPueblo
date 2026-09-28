import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AUDITORIA_LABELS, AUDITORIA_TABLA_LABELS, AUDITORIA_ACCION_LABELS } from '@/constants/auditoria.constants'
import { formatearFechaHora } from '@/lib/date'
import type { AuditoriaAccion } from '@/types/auditoria'
import type { AuditoriaTableProps } from './auditoria.types'

const ACCION_VARIANT: Record<AuditoriaAccion, 'default' | 'secondary' | 'destructive'> = {
  create: 'default',
  update: 'secondary',
  delete: 'destructive',
}

export default function AuditoriaTable({ eventos, onVerDetalle }: AuditoriaTableProps) {
  if (eventos.length === 0) {
    return <p className="text-center text-gray-500 py-8">{AUDITORIA_LABELS.sinEventos}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">{AUDITORIA_LABELS.fecha}</th>
            <th className="px-4 py-3 text-left">{AUDITORIA_LABELS.tabla}</th>
            <th className="px-4 py-3 text-left">{AUDITORIA_LABELS.accion}</th>
            <th className="px-4 py-3 text-left">{AUDITORIA_LABELS.registro}</th>
            <th className="px-4 py-3 text-left">{AUDITORIA_LABELS.usuario}</th>
            <th className="px-4 py-3 text-right">{AUDITORIA_LABELS.detalle}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {eventos.map((evento) => (
            <tr key={evento.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{formatearFechaHora(evento.fecha)}</td>
              <td className="px-4 py-3">{AUDITORIA_TABLA_LABELS[evento.tabla]}</td>
              <td className="px-4 py-3">
                <Badge variant={ACCION_VARIANT[evento.accion]}>{AUDITORIA_ACCION_LABELS[evento.accion]}</Badge>
              </td>
              <td className="px-4 py-3 text-gray-600">#{evento.registro_id}</td>
              <td className="px-4 py-3 text-gray-600">
                {evento.usuarios?.nombre ?? AUDITORIA_LABELS.usuarioDesconocido}
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => onVerDetalle(evento)}>
                  {AUDITORIA_LABELS.detalle}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
