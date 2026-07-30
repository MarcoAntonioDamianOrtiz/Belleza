export type EstadoGarantia = 'pendiente' | 'aprobada' | 'rechazada'

export interface Garantia {
  id: number
  folio: string
  ventaFolio: string
  fechaSolicitud: string
  cliente: string
  producto: string
  variante: string
  sku: string
  garantiaMeses: number
  fechaLimite: string
  vigente: boolean
  motivo: string
  estado: EstadoGarantia
  resolucion?: string
}
