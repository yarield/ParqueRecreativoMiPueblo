import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AuditoriaTable from '@/components/auditoria/AuditoriaTable'
import AuditoriaDetalleDialog from '@/components/auditoria/AuditoriaDetalleDialog'
import Paginacion from '@/components/common/Paginacion'
import { useAuditoria } from '@/hooks/useAuditoria'
import {
  AUDITORIA_LABELS,
  AUDITORIA_TABLA_LABELS,
  AUDITORIA_ACCION_LABELS,
} from '@/constants/auditoria.constants'
import { PAGINACION_TAMANO_POR_DEFECTO } from '@/constants/paginacion.constants'
import type { AuditoriaAccion, AuditoriaEvento, AuditoriaTabla } from '@/types/auditoria'
import type { PaginacionControl } from '@/types/paginacion'

export default function AuditoriaPage() {
  const [tabla, setTabla] = useState<AuditoriaTabla | 'todas'>('todas')
  const [accion, setAccion] = useState<AuditoriaAccion | 'todas'>('todas')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [pagina, setPagina] = useState(1)
  const [tamano, setTamano] = useState(PAGINACION_TAMANO_POR_DEFECTO)
  const [eventoDetalle, setEventoDetalle] = useState<AuditoriaEvento | null>(null)

  // Otro filtro es otro conjunto de resultados: se vuelve a la primera página.
  useEffect(() => setPagina(1), [tabla, accion, desde, hasta])

  const { data, isLoading } = useAuditoria({
    tabla: tabla === 'todas' ? undefined : tabla,
    accion: accion === 'todas' ? undefined : accion,
    desde: desde || undefined,
    hasta: hasta || undefined,
    pagina,
    por_pagina: tamano,
  })

  const eventos = data?.eventos ?? []
  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / tamano))

  // La paginación es del servidor (esta tabla puede crecer sin límite), así que
  // el control se arma a mano en vez de usar usePaginacion (esa pagina en
  // memoria una lista que ya se trajo completa).
  const paginacion: PaginacionControl = {
    pagina,
    totalPaginas,
    totalItems: total,
    desde: total === 0 ? 0 : (pagina - 1) * tamano + 1,
    hasta: Math.min(pagina * tamano, total),
    tamano,
    irA: (p) => setPagina(Math.min(Math.max(1, p), totalPaginas)),
    cambiarTamano: (nuevo) => {
      setTamano(nuevo)
      setPagina(1)
    },
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{AUDITORIA_LABELS.titulo}</h2>
        <p className="text-sm text-gray-500">{AUDITORIA_LABELS.subtitulo}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={tabla} onValueChange={(v) => setTabla(v as AuditoriaTabla | 'todas')}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{AUDITORIA_LABELS.todasTablas}</SelectItem>
            {Object.entries(AUDITORIA_TABLA_LABELS).map(([valor, etiqueta]) => (
              <SelectItem key={valor} value={valor}>{etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={accion} onValueChange={(v) => setAccion(v as AuditoriaAccion | 'todas')}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{AUDITORIA_LABELS.todasAcciones}</SelectItem>
            {Object.entries(AUDITORIA_ACCION_LABELS).map(([valor, etiqueta]) => (
              <SelectItem key={valor} value={valor}>{etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-40"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          title={AUDITORIA_LABELS.desde}
        />
        <Input
          type="date"
          className="w-40"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          title={AUDITORIA_LABELS.hasta}
        />
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : (
        <>
          <AuditoriaTable eventos={eventos} onVerDetalle={setEventoDetalle} />
          <Paginacion control={paginacion} />
        </>
      )}

      <AuditoriaDetalleDialog
        open={!!eventoDetalle}
        onClose={() => setEventoDetalle(null)}
        evento={eventoDetalle}
      />
    </div>
  )
}
