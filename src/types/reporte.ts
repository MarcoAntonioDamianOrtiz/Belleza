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
