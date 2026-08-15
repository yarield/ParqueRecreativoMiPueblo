import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PAGINACION_LABELS, PAGINACION_TAMANOS } from '@/constants/paginacion.constants'
import { paginasVisibles } from '@/lib/paginacion'
import type { PaginacionProps } from './paginacion.types'

export default function Paginacion({ control }: PaginacionProps) {
  const { pagina, totalPaginas, totalItems, desde, hasta, tamano, irA, cambiarTamano } = control

  // Sin registros no hay nada que paginar: la tabla ya muestra su propio aviso.
  if (totalItems === 0) return null

  const paginas = paginasVisibles(pagina, totalPaginas)
  const primeraVisible = paginas[0]
  const ultimaVisible = paginas[paginas.length - 1]

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-gray-500">
        {`${PAGINACION_LABELS.mostrando} ${desde}–${hasta} ${PAGINACION_LABELS.de} ${totalItems} ${PAGINACION_LABELS.registros}`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{PAGINACION_LABELS.porPagina}</span>
          <Select value={String(tamano)} onValueChange={(v) => cambiarTamano(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINACION_TAMANOS.map((t) => (
                <SelectItem key={t} value={String(t)}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Con una sola página se deja el resumen y el tamaño, pero navegar no
            tendría sentido. */}
        {totalPaginas > 1 && (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={pagina === 1} onClick={() => irA(pagina - 1)}>
              {PAGINACION_LABELS.anterior}
            </Button>

            {/* La primera y la última siempre quedan a un clic, aunque la
                ventana de números no llegue hasta ellas. */}
            {primeraVisible > 1 && (
              <>
                <Button size="sm" variant="outline" onClick={() => irA(1)}>1</Button>
                {primeraVisible > 2 && (
                  <span className="px-1 text-gray-400">{PAGINACION_LABELS.elipsis}</span>
                )}
              </>
            )}

            {paginas.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={p === pagina ? 'default' : 'outline'}
                onClick={() => irA(p)}
              >
                {p}
              </Button>
            ))}

            {ultimaVisible < totalPaginas && (
              <>
                {ultimaVisible < totalPaginas - 1 && (
                  <span className="px-1 text-gray-400">{PAGINACION_LABELS.elipsis}</span>
                )}
                <Button size="sm" variant="outline" onClick={() => irA(totalPaginas)}>
                  {totalPaginas}
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={pagina === totalPaginas}
              onClick={() => irA(pagina + 1)}
            >
              {PAGINACION_LABELS.siguiente}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
