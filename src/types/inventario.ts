export type TipoMovimientoInventario = 'entrada' | 'salida' | 'ajuste'

export interface MovimientoInventario {
  id: number
  fecha: string
  producto: string
  variante: string
  sku: string
  tipo: TipoMovimientoInventario
  cantidad: number
  motivo: string
}
