export interface Variante {
  id: string
  productoId: string
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  stockMinimo: number
  garantiaMeses: number | null
  activo: boolean
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface VariantePayload {
  producto: string
  codigo_barras: string
  sku: string
  nombre: string
  stock: number
  stock_minimo: number
  costo: number
  precio_menudeo: number
  precio_mayoreo: number
  garantia_meses: number | null
  activo?: boolean
}
