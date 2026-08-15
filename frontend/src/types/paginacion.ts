/**
 * Estado y acciones de una paginación, sin el tipo de los registros: así el
 * componente de controles no necesita ser genérico.
 */
export interface PaginacionControl {
  pagina: number
  totalPaginas: number
  totalItems: number
  // Posición (empezando en 1) del primer y último registro visible. 0 si no hay.
  desde: number
  hasta: number
  tamano: number
  irA: (pagina: number) => void
  cambiarTamano: (tamano: number) => void
}
