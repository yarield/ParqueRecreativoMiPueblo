import type { AuditoriaAccion, AuditoriaTabla } from '@/types/auditoria'

export const AUDITORIA_LABELS = {
  titulo: 'Auditoría',
  subtitulo: 'Quién creó, editó o borró cada registro.',
  tabla: 'Tabla',
  accion: 'Acción',
  registro: 'Registro',
  usuario: 'Usuario',
  fecha: 'Fecha',
  detalle: 'Detalle',
  todasTablas: 'Todas las tablas',
  todasAcciones: 'Todas las acciones',
  desde: 'Desde',
  hasta: 'Hasta',
  sinEventos: 'No hay eventos de auditoría con esos filtros.',
  usuarioDesconocido: 'Sistema / usuario eliminado',
  datosAnteriores: 'Valores anteriores',
  datosNuevos: 'Valores nuevos',
  sinDatos: 'Sin datos',
} as const

export const AUDITORIA_TABLA_LABELS: Record<AuditoriaTabla, string> = {
  clientes: 'Clientes',
  paquetes: 'Paquetes',
  categorias: 'Categorías',
  facturas: 'Facturas',
  usuarios: 'Usuarios',
}

export const AUDITORIA_ACCION_LABELS: Record<AuditoriaAccion, string> = {
  create: 'Creación',
  update: 'Edición',
  delete: 'Borrado',
}
