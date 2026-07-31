export type EstadoCaja = 'ABIERTA' | 'CERRADA'

export interface Caja {
  id: string
  nombre: string
  estado: EstadoCaja
  activa: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface CorteCaja {
  id: string
  caja: string
  usuario: string
  fechaInicio: string
  fechaFin: string | null
  efectivoInicial: number
  efectivoFinal: number | null
  diferencia: number | null
}

export interface AbrirCajaPayload {
  caja_id: string
  efectivo_inicial: number
}

export interface CerrarCajaPayload {
  caja_id: string
  efectivo_final: number
}
