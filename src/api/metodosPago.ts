import api from './axios'

import type { MetodoPagoCatalogo } from '@/types/metodoPago'
import type { ApiResponse } from '@/types/api'

interface MetodoPagoApi {
  id: string
  nombre: string
  activo: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

function mapMetodo(item: MetodoPagoApi): MetodoPagoCatalogo {
  return {
    id: item.id,
    nombre: item.nombre,
    activo: item.activo,
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getMetodosPago(): Promise<MetodoPagoCatalogo[]> {
  const { data } = await api.get<ApiResponse<MetodoPagoApi[]>>('/metodos-pago/')
  return data.data.map(mapMetodo)
}

export async function getMetodosPagoActivos(): Promise<MetodoPagoCatalogo[]> {
  const { data } =
    await api.get<ApiResponse<Array<{ id: string; nombre: string }>>>('/metodos-pago/activos/')

  return data.data.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    activo: true,
  }))
}

export async function updateMetodoPago(
  id: string,
  activo: boolean,
): Promise<MetodoPagoCatalogo> {
  const { data } = await api.put<ApiResponse<MetodoPagoApi>>(`/metodos-pago/${id}/`, { activo })
  return mapMetodo(data.data)
}

export async function deleteMetodoPago(id: string): Promise<void> {
  await api.delete(`/metodos-pago/${id}/`)
}
