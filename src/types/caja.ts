export type EstadoCaja = 'abierta' | 'cerrada'
export type TipoMovimientoCaja = 'venta' | 'entrada' | 'salida'

export interface MovimientoCaja {
  id: number
  fecha: string
  tipo: TipoMovimientoCaja
  concepto: string
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia'
  monto: number
}

export interface SesionCaja {
  id: number
  estado: EstadoCaja
  fechaApertura: string
  fechaCierre?: string
  usuario: string
  montoInicial: number
  efectivoEsperado: number
  efectivoContado?: number
  diferencia?: number
  observaciones?: string
}
