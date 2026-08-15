import { useEffect, useMemo, useState } from 'react'
import { PAGINACION_TAMANO_POR_DEFECTO } from '@/constants/paginacion.constants'
import type { PaginacionControl } from '@/types/paginacion'

/**
 * Pagina en memoria una lista ya filtrada. Los listados de la app se traen
 * completos y se filtran en el cliente, así que la paginación va en el mismo
 * sitio: no hace falta pedirle nada más al servidor para cambiar de página.
 *
 * `reiniciarEn` son los filtros de quien usa el hook: cuando cambian, el
 * conjunto es otro y se vuelve a la primera página. Un refetch o un borrado no
 * reinician nada, solo recortan la página si quedó fuera de rango.
 */
export function usePaginacion<T>(
  items: T[],
  reiniciarEn: unknown[] = [],
  tamanoInicial: number = PAGINACION_TAMANO_POR_DEFECTO
): { items: T[]; control: PaginacionControl } {
  const [pagina, setPagina] = useState(1)
  const [tamano, setTamano] = useState(tamanoInicial)

  const totalItems = items.length
  const totalPaginas = Math.max(1, Math.ceil(totalItems / tamano))

  // Borrar el último registro de una página la dejaría fuera de rango: se
  // muestra la última que sí existe en vez de una tabla vacía.
  const paginaActual = Math.min(pagina, totalPaginas)

  useEffect(() => {
    setPagina(1)
    // Las dependencias las decide quien usa el hook (sus filtros).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, reiniciarEn)

  const inicio = (paginaActual - 1) * tamano
  const itemsPagina = useMemo(() => items.slice(inicio, inicio + tamano), [items, inicio, tamano])

  function cambiarTamano(nuevo: number) {
    setTamano(nuevo)
    // Con otro tamaño el registro que se estaba viendo cae en otra página;
    // volver al principio es más predecible que intentar conservarlo.
    setPagina(1)
  }

  return {
    items: itemsPagina,
    control: {
      pagina: paginaActual,
      totalPaginas,
      totalItems,
      desde: totalItems === 0 ? 0 : inicio + 1,
      hasta: Math.min(inicio + tamano, totalItems),
      tamano,
      irA: (p) => setPagina(Math.min(Math.max(1, p), totalPaginas)),
      cambiarTamano,
    },
  }
}
