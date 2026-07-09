interface PaqueteDuracion {
  duracion_dias: number
  duracion_unidad: 'dias' | 'meses'
}

/**
 * Formatea una fecha (ISO o 'YYYY-MM-DD') a formato local es-VE sin desfase de
 * zona horaria. Las fechas se guardan como medianoche UTC; interpretarlas en
 * hora local con `new Date(iso)` restaría un día en zonas UTC negativas.
 */
export function formatearFecha(fechaStr: string): string {
  return new Date(fechaStr.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-VE')
}

export function sumarDias(fechaStr: string, dias: number): string {
  const fecha = new Date(fechaStr + 'T00:00:00')
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

export function sumarMeses(fechaStr: string, meses: number): string {
  const fecha = new Date(fechaStr + 'T00:00:00')
  const diaAncla = fecha.getDate()
  const mesDestino = fecha.getMonth() + meses

  const ultimoDiaDelMesDestino = new Date(fecha.getFullYear(), mesDestino + 1, 0).getDate()
  const diaFinal = Math.min(diaAncla, ultimoDiaDelMesDestino)

  const resultado = new Date(fecha.getFullYear(), mesDestino, diaFinal)
  return resultado.toISOString().slice(0, 10)
}

export interface FacturaCiclo {
  fecha_facturacion: string
  fecha_proximo_pago: string
}

// Suma un período completo del paquete (días o meses) a una fecha.
function sumarPeriodo(fechaStr: string, paquete: PaqueteDuracion): string {
  return paquete.duracion_unidad === 'dias'
    ? sumarDias(fechaStr, paquete.duracion_dias)
    : sumarMeses(fechaStr, paquete.duracion_dias)
}

// Fecha de inicio del "streak" vigente: la primera factura del tramo continuo
// actual. Un tramo se corta cuando el cliente vuelve a facturar más de un
// período completo después de que venció su cobertura (reingreso tras pausa).
// Ese origen es el ancla que mantiene el día de cobro estable frente al clamp
// de fin de mes (ej. 31 ene -> 28 feb -> 31 mar).
function anclaStreakVigente(facturas: FacturaCiclo[], paquete: PaqueteDuracion): string {
  const orden = [...facturas].sort((a, b) => a.fecha_facturacion.localeCompare(b.fecha_facturacion))
  let ancla = orden[0].fecha_facturacion
  let cobertura = orden[0].fecha_proximo_pago

  for (let i = 1; i < orden.length; i++) {
    if (orden[i].fecha_facturacion >= sumarPeriodo(cobertura, paquete)) {
      ancla = orden[i].fecha_facturacion
    }
    if (orden[i].fecha_proximo_pago > cobertura) {
      cobertura = orden[i].fecha_proximo_pago
    }
  }
  return ancla
}

/**
 * Calcula la fecha del próximo pago para una nueva factura.
 *
 * - Cliente continuo (renueva antes de vencer, o con un atraso menor a un
 *   período completo): el ciclo se mantiene anclado a su primera factura, así
 *   el día de cobro no cambia y no se pierde tiempo ya pagado.
 * - Reingreso tras pausa (factura más de un período completo después de que
 *   venció su cobertura): el ciclo se re-ancla a esta fecha de facturación,
 *   como si fuera un nuevo ingreso.
 */
export function calcularProximoPago(
  fechaFacturacionStr: string,
  paquete: PaqueteDuracion,
  facturasCliente: FacturaCiclo[]
): string {
  // Guard: una duración no positiva provocaría un bucle infinito en el cálculo
  // por meses. Se devuelve la fecha de facturación sin iterar.
  if (!Number.isFinite(paquete.duracion_dias) || paquete.duracion_dias <= 0) {
    return fechaFacturacionStr
  }

  const ultimoPago = facturasCliente
    .map((f) => f.fecha_proximo_pago)
    .sort()
    .at(-1)

  // Continuo mientras se facture dentro del período de gracia (un ciclo después
  // del vencimiento). Pasado eso, se considera reingreso y se re-ancla.
  const continuo = ultimoPago !== undefined && fechaFacturacionStr < sumarPeriodo(ultimoPago, paquete)

  // Piso: desde dónde cuenta el próximo pago. Si es continuo arranca desde la
  // cobertura vigente (no se pierde tiempo); si es reingreso, desde hoy.
  const piso = continuo ? ultimoPago! : fechaFacturacionStr

  if (paquete.duracion_unidad === 'dias') {
    return sumarDias(piso, paquete.duracion_dias)
  }

  // Para meses, ancla al origen del tramo (continuo) o a hoy (reingreso) y
  // avanza ciclo a ciclo hasta pasar el piso, preservando el día de cobro.
  const ancla = continuo ? anclaStreakVigente(facturasCliente, paquete) : fechaFacturacionStr
  let ciclo = 1
  while (sumarMeses(ancla, ciclo * paquete.duracion_dias) <= piso) {
    ciclo += 1
  }
  return sumarMeses(ancla, ciclo * paquete.duracion_dias)
}
