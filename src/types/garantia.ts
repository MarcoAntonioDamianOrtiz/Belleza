export type EstadoGarantia = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'FINALIZADA'

export type ResolucionGarantia = 'REEMPLAZO' | 'CAMBIO' | 'REPARACION'

export interface Garantia {
  id: string
  ventaId: string
  ventaFolio: string
  usuario: string
  varianteId: string
  producto: string
  variante: string
  motivo: string
  estado: EstadoGarantia
  resolucion: ResolucionGarantia | null
  observaciones: string
  fecha: string
  fechaActualizacion?: string
}

export interface GarantiaPayload {
  venta_id: string
  variante_id: string
  motivo: string
  usuario_id?: string
}
