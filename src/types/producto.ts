import type { Variante } from './variante'

export interface Producto {
  id: string
  categoriaId: string
  categoria: string
  nombre: string
  descripcion: string
  activo: boolean
  variantes: Variante[]
  fechaCreacion?: string
  fechaActualizacion?: string
}

export interface ProductoPayload {
  categoria: string
  nombre: string
  descripcion?: string
  activo?: boolean
}
