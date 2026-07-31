export interface MetodoPagoCatalogo {
  id: string
  nombre: string
  activo: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface MetodoPagoPayload {
  nombre: string
  activo?: boolean
}
