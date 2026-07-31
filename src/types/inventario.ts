export type TipoMovimientoInventario = 'ENTRADA' | 'SALIDA' | 'AJUSTE'

export interface MovimientoInventario {
  id: string
  variante: string
  tipo: TipoMovimientoInventario
  cantidad: number
  observaciones: string
  usuario: string
  fecha: string
}

export interface MovimientoPayload {
  variante_id: string
  cantidad: number
  observaciones?: string
}

export interface MovimientoResultado {
  success: boolean
  message: string
  data: {
    id: string
  }
}
