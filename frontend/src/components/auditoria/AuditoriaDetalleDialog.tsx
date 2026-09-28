import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AUDITORIA_LABELS, AUDITORIA_TABLA_LABELS, AUDITORIA_ACCION_LABELS } from '@/constants/auditoria.constants'
import { formatearFechaHora } from '@/lib/date'
import type { AuditoriaDetalleDialogProps } from './auditoria.types'

function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  return String(valor)
}

function ListaValores({
  datos,
  resaltarClaves,
}: {
  datos: Record<string, unknown> | null
  resaltarClaves: Set<string>
}) {
  if (!datos) return <p className="text-sm text-gray-400">{AUDITORIA_LABELS.sinDatos}</p>

  return (
    <dl className="text-sm space-y-1">
      {Object.keys(datos).map((clave) => (
        <div
          key={clave}
          className={`flex justify-between gap-4 ${
            resaltarClaves.has(clave) ? 'font-medium text-gray-900' : 'text-gray-600'
          }`}
        >
          <dt>{clave}</dt>
          <dd className="text-right break-all">{formatearValor(datos[clave])}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function AuditoriaDetalleDialog({ open, onClose, evento }: AuditoriaDetalleDialogProps) {
  const anteriores = evento?.datos_anteriores ?? null
  const nuevos = evento?.datos_nuevos ?? null

  // Solo se resaltan las claves que sí cambiaron: en un create/delete un lado
  // siempre está vacío, así que no hay nada que comparar.
  const clavesCambiadas = new Set(
    anteriores && nuevos
      ? Object.keys(nuevos).filter((clave) => JSON.stringify(nuevos[clave]) !== JSON.stringify(anteriores[clave]))
      : []
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {evento &&
              `${AUDITORIA_TABLA_LABELS[evento.tabla]} #${evento.registro_id} — ${AUDITORIA_ACCION_LABELS[evento.accion]}`}
          </DialogTitle>
        </DialogHeader>

        {evento && (
          <div className="space-y-4 mt-2">
            <p className="text-xs text-gray-500">
              {formatearFechaHora(evento.fecha)} · {evento.usuarios?.nombre ?? AUDITORIA_LABELS.usuarioDesconocido}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {AUDITORIA_LABELS.datosAnteriores}
                </h4>
                <ListaValores datos={anteriores} resaltarClaves={clavesCambiadas} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {AUDITORIA_LABELS.datosNuevos}
                </h4>
                <ListaValores datos={nuevos} resaltarClaves={clavesCambiadas} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
