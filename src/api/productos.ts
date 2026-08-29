import api from './axios'

import { unwrapData, unwrapList } from '@/utils/apiResponse'

import type { ProductoPayload } from '@/types/producto'

export interface ProductoApi {
  id: string
  categoria: string
  categoria_nombre?: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

export async function getProductos(): Promise<ProductoApi[]> {
  const { data } = await api.get('/productos/')
  return unwrapList<ProductoApi>(data)
}

export async function createProducto(payload: ProductoPayload): Promise<ProductoApi> {
  const { data } = await api.post('/productos/', payload)
  return unwrapData<ProductoApi>(data)
}

export async function updateProducto(id: string, payload: ProductoPayload): Promise<ProductoApi> {
  const { data } = await api.put(`/productos/${id}/`, payload)
  return unwrapData<ProductoApi>(data)
}

export async function deleteProducto(id: string): Promise<void> {
  await api.delete(`/productos/${id}/`)
}
