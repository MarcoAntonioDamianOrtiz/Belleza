export type TipoDevolucion = 'NORMAL' | 'GARANTIA' | 'EXTRAORDINARIA'

export type EstadoDevolucion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'FINALIZADA'

export interface ProductoDevolucion {
  varianteId: string
  producto: string
  variante: string
  cantidad: number
}

export interface Devolucion {
  id: string
  ventaId: string
  ventaFolio: string
  usuario: string
  tipo: TipoDevolucion
  motivo: string
  estado: EstadoDevolucion
  fecha: string
  productos: ProductoDevolucion[]
}

export interface DevolucionPayload {
  venta_id: string
  tipo: TipoDevolucion
  motivo: string
  productos: Array<{
    variante_id: string
    cantidad: number
  }>
  autorizado_por?: string
}
