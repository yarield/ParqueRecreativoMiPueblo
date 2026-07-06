export type DescuentoTipo = 'porcentaje' | 'monto'

/**
 * Calcula el monto absoluto a descontar sobre una base, según el tipo de
 * descuento. El resultado nunca es negativo ni supera la base.
 */
export function calcularMontoDescuento(base: number, tipo: DescuentoTipo, valor: number): number {
  // Blindaje ante valores no válidos (NaN, negativos): sin descuento.
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(valor) || valor <= 0) return 0
  const monto = tipo === 'porcentaje' ? base * (valor / 100) : valor
  return Math.min(base, Math.max(0, monto))
}
