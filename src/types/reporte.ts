export type ReporteClave =
  | 'ventas'
  | 'inventario'
  | 'stock-bajo'
  | 'cortes'
  | 'productos'
  | 'devoluciones'
  | 'garantias'
  | 'movimientos'

export type ReporteFila = Record<string, unknown>


export interface ResumenDia {
  fecha: string
  cantidadVentas: number
  subtotal: number
  descuento: number
  iva: number
  totalVendido: number
  reembolsos: number
  ventaNeta: number
  metodosPago: Record<string, number>
  reembolsosPorMetodo: Record<string, number>
}
