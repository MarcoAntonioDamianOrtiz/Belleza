export type EstadoDevolucion = 'pendiente' | 'aprobada' | 'rechazada'
export type TipoDevolucion = 'reembolso' | 'cambio'

export interface Devolucion {
  id: number
  folio: string
  ventaFolio: string
  fechaSolicitud: string
  cliente: string
  producto: string
  variante: string
  cantidad: number
  tipo: TipoDevolucion
  motivo: string
  estado: EstadoDevolucion
  resolucion?: string
}
