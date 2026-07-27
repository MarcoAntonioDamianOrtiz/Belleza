export interface Variante {
  id: number
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  garantiaMeses: number | null
}
