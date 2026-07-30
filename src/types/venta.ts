export type TipoPrecio = 'menudeo' | 'mayoreo'
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export interface VarianteVenta {
  id: number
  producto: string
  variante: string
  sku: string
  codigoBarras: string
  stock: number
  precioMenudeo: number
  precioMayoreo: number
}

export interface CarritoItem {
  variante: VarianteVenta
  cantidad: number
}

export interface VentaRealizada {
  id: number
  folio: string
  fecha: string
  usuario: string
  tipoPrecio: TipoPrecio
  metodoPago: MetodoPago
  items: CarritoItem[]
  subtotal: number
  descuento: number
  iva: number
  total: number
  efectivoRecibido?: number
  cambio?: number
}
