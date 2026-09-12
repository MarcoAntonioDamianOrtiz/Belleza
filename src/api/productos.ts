import api from './axios'
import { getAllPages } from './pagination'

import { unwrapData } from '@/utils/apiResponse'

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

export async function getProductos(activo?: 'todos' | 'true' | 'false'): Promise<ProductoApi[]> {
  return getAllPages<ProductoApi>(api, '/productos/', {
    page_size: 200,
    activo,
  })
}

export async function createProducto(payload: ProductoPayload): Promise<ProductoApi> {
  const { data } = await api.post('/productos/', payload)
  return unwrapData<ProductoApi>(data)
}

export async function updateProducto(id: string, payload: ProductoPayload): Promise<ProductoApi> {
  const { data } = await api.put(`/productos/${id}/`, payload)
  return unwrapData<ProductoApi>(data)
}

export async function activarProducto(id: string): Promise<void> {
  await api.post(`/productos/${id}/activar/`)
}

export async function desactivarProducto(id: string): Promise<void> {
  await api.post(`/productos/${id}/desactivar/`)
}
