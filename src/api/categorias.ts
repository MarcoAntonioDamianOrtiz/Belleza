import api from './axios'

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
  const { data } = await api.get<CategoriaApi[]>('/categorias/')
  return data.map(mapCategoria)
}

export async function createCategoria(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.post<CategoriaApi>('/categorias/', payload)
  return mapCategoria(data)
}

export async function updateCategoria(id: string, payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.put<CategoriaApi>(`/categorias/${id}/`, payload)
  return mapCategoria(data)
}

export async function deleteCategoria(id: string): Promise<void> {
  await api.delete(`/categorias/${id}/`)
}
