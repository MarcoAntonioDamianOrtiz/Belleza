import api from './axios'

import type { ProductoPayload } from '@/types/producto'

export interface ProductoApi {
  id: string
  categoria: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

export async function getProductos(): Promise<ProductoApi[]> {
  const { data } = await api.get<ProductoApi[]>('/productos/')
  return data
}

export async function createProducto(payload: ProductoPayload): Promise<ProductoApi> {
  const { data } = await api.post<ProductoApi>('/productos/', payload)
  return data
}

export async function updateProducto(id: string, payload: ProductoPayload): Promise<ProductoApi> {
  const { data } = await api.put<ProductoApi>(`/productos/${id}/`, payload)
  return data
}

export async function deleteProducto(id: string): Promise<void> {
  await api.delete(`/productos/${id}/`)
}
