import api from './axios'
import { getAllPages } from './pagination'

import { unwrapData } from '@/utils/apiResponse'

import type { Categoria, CategoriaPayload } from '@/types/categoria'

interface CategoriaApi {
  id: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

function mapCategoria(item: CategoriaApi): Categoria {
  return {
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion ?? '',
    activo: item.activo,
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getCategorias(): Promise<Categoria[]> {
  const items = await getAllPages<CategoriaApi>(api, '/categorias/', { page_size: 200 })
  return items.map(mapCategoria)
}

export async function createCategoria(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.post('/categorias/', payload)
  return mapCategoria(unwrapData<CategoriaApi>(data))
}

export async function updateCategoria(id: string, payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.put(`/categorias/${id}/`, payload)
  return mapCategoria(unwrapData<CategoriaApi>(data))
}

export async function activarCategoria(id: string): Promise<void> {
  await api.post(`/categorias/${id}/activar/`)
}

export async function desactivarCategoria(id: string): Promise<void> {
  await api.post(`/categorias/${id}/desactivar/`)
}
