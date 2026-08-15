import { PAGINACION_MAX_BOTONES } from '@/constants/paginacion.constants'

/**
 * Números de página a mostrar alrededor de la actual. La ventana conserva
 * siempre el mismo ancho: al acercarse a un extremo se completa hacia el otro
 * lado, para que los botones no cambien de cantidad al navegar.
 */
export function paginasVisibles(
  pagina: number,
  totalPaginas: number,
  maximo: number = PAGINACION_MAX_BOTONES
): number[] {
  const ancho = Math.min(maximo, totalPaginas)
  if (ancho <= 0) return []

  const inicioIdeal = pagina - Math.floor(ancho / 2)
  const inicio = Math.min(Math.max(1, inicioIdeal), totalPaginas - ancho + 1)

  return Array.from({ length: ancho }, (_, i) => inicio + i)
}
