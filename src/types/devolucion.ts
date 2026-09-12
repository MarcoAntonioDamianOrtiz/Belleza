export type TipoDevolucion = 'NORMAL' | 'DEFECTUOSO' | 'GARANTIA' | 'EXTRAORDINARIA'

export type EstadoDevolucion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'

export interface ProductoDevolucion {
  id: string
  producto: string
  variante: string
  cantidad: number
  precioOriginal: number
  subtotal: number
}

export interface Devolucion {
  id: string
  ventaFolio: string
  usuario: string
  metodoPagoReembolso: string
  tipo: TipoDevolucion
  motivo: string
  estado: EstadoDevolucion
  totalDevuelto: number
  fecha: string
  productos: ProductoDevolucion[]
}

export interface DevolucionPayload {
  venta_id: string
  tipo: TipoDevolucion
  motivo: string
  productos: Array<{
    detalle_venta_id: string
    cantidad: number
  }>
}
