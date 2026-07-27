import type { Variante } from './variante'

export interface Producto {
  id: number
  nombre: string
  categoria: string
  descripcion?: string
  variantes: Variante[]
}
