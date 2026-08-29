import api from './axios'

import { unwrapData, unwrapList } from '@/utils/apiResponse'

import type { Variante, VariantePayload } from '@/types/variante'

interface VarianteApi {
  id: string
  producto: string
  codigo_barras: string
  sku: string
  nombre: string
  stock: number
  stock_minimo: number
  costo: string | number
  precio_menudeo: string | number
  precio_mayoreo: string | number
  garantia_meses: number | null
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

function mapVariante(item: VarianteApi): Variante {
  return {
    id: item.id,
    productoId: item.producto,
    codigoBarras: item.codigo_barras,
    sku: item.sku,
    nombre: item.nombre,
    stock: Number(item.stock),
    stockMinimo: Number(item.stock_minimo),
    costo: Number(item.costo),
    precioMenudeo: Number(item.precio_menudeo),
    precioMayoreo: Number(item.precio_mayoreo),
    garantiaMeses: item.garantia_meses,
    activo: item.activo,
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getVariantes(): Promise<Variante[]> {
  const { data } = await api.get('/variantes/')
  return unwrapList<VarianteApi>(data).map(mapVariante)
}

export async function getVarianteByCode(codigo: string): Promise<Variante> {
  const { data } = await api.get(`/variantes/codigo/${encodeURIComponent(codigo)}/`)

  return mapVariante(unwrapData<VarianteApi>(data))
}

export async function createVariante(payload: VariantePayload): Promise<Variante> {
  const { data } = await api.post('/variantes/', payload)
  return mapVariante(unwrapData<VarianteApi>(data))
}

export async function updateVariante(id: string, payload: VariantePayload): Promise<Variante> {
  const { data } = await api.put(`/variantes/${id}/`, payload)
  return mapVariante(unwrapData<VarianteApi>(data))
}

export async function deleteVariante(id: string): Promise<void> {
  await api.delete(`/variantes/${id}/`)
}
