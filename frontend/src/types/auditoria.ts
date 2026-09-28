export type AuditoriaTabla = 'clientes' | 'paquetes' | 'categorias' | 'facturas' | 'usuarios'
export type AuditoriaAccion = 'create' | 'update' | 'delete'

export interface AuditoriaUsuario {
  id: number
  nombre: string
  email: string
}

export interface AuditoriaEvento {
  id: number
  tabla: AuditoriaTabla
  registro_id: number
  accion: AuditoriaAccion
  usuario_id: number | null
  datos_anteriores: Record<string, unknown> | null
  datos_nuevos: Record<string, unknown> | null
  fecha: string
  usuarios: AuditoriaUsuario | null
}

export interface AuditoriaFiltros {
  tabla?: AuditoriaTabla
  accion?: AuditoriaAccion
  desde?: string
  hasta?: string
  pagina: number
  por_pagina: number
}

export interface AuditoriaRespuesta {
  total: number
  pagina: number
  por_pagina: number
  eventos: AuditoriaEvento[]
}
