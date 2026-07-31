import api from './axios'

import { unwrapData } from '@/utils/apiResponse'

import type {
  Devolucion,
  DevolucionPayload,
  EstadoDevolucion,
  TipoDevolucion,
} from '@/types/devolucion'

interface DevolucionApi {
  id: string
  venta_id?: string
  venta?: string | { id?: string; folio?: string }
  venta_folio?: string
  usuario?: string | { nombre?: string }
  tipo: TipoDevolucion
  motivo: string
  estado: EstadoDevolucion
  fecha: string
  productos?: Array<{
    variante_id?: string
    variante?: string | { id?: string; nombre?: string; producto?: string }
    producto?: string
    cantidad: number
  }>
  detalles?: Array<{
    variante_id?: string
    variante?: string | { id?: string; nombre?: string; producto?: string }
    producto?: string
    cantidad: number
  }>
}

function mapDevolucion(item: DevolucionApi): Devolucion {
  const ventaObject = typeof item.venta === 'object' && item.venta !== null ? item.venta : null

  const usuario =
    typeof item.usuario === 'object'
      ? (item.usuario?.nombre ?? 'Usuario')
      : (item.usuario ?? 'Usuario')

  const productos = item.productos ?? item.detalles ?? []

  return {
    id: item.id,
    ventaId: item.venta_id ?? ventaObject?.id ?? (typeof item.venta === 'string' ? item.venta : ''),
    ventaFolio:
      item.venta_folio ?? ventaObject?.folio ?? (typeof item.venta === 'string' ? item.venta : '—'),
    usuario,
    tipo: item.tipo,
    motivo: item.motivo,
    estado: item.estado,
    fecha: item.fecha,
    productos: productos.map((detail) => {
      const variantObject =
        typeof detail.variante === 'object' && detail.variante !== null ? detail.variante : null

      return {
        varianteId: detail.variante_id ?? variantObject?.id ?? '',
        producto: detail.producto ?? variantObject?.producto ?? 'Producto',
        variante:
          variantObject?.nombre ??
          (typeof detail.variante === 'string' ? detail.variante : 'Variante'),
        cantidad: Number(detail.cantidad),
      }
    }),
  }
}

export async function getDevoluciones(): Promise<Devolucion[]> {
  const { data } = await api.get<DevolucionApi[] | { data: DevolucionApi[] }>('/devoluciones/')

  return unwrapData(data).map(mapDevolucion)
}

export async function getDevolucion(id: string): Promise<Devolucion> {
  const { data } = await api.get<DevolucionApi | { data: DevolucionApi }>(`/devoluciones/${id}/`)

  return mapDevolucion(unwrapData(data))
}

export async function createDevolucion(payload: DevolucionPayload): Promise<unknown> {
  const { data } = await api.post('/devoluciones/', payload)
  return data
}

export async function updateDevolucion(
  id: string,
  payload: Partial<{ estado: EstadoDevolucion; motivo: string }>,
): Promise<unknown> {
  const { data } = await api.put(`/devoluciones/${id}/`, payload)
  return data
}

export async function aprobarDevolucion(id: string): Promise<unknown> {
  const { data } = await api.post(`/devoluciones/${id}/aprobar/`)
  return data
}

export async function rechazarDevolucion(id: string): Promise<unknown> {
  const { data } = await api.post(`/devoluciones/${id}/rechazar/`)
  return data
}
