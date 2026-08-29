import api from './axios'

import { unwrapData, unwrapList } from '@/utils/apiResponse'

import type {
  Devolucion,
  DevolucionPayload,
  EstadoDevolucion,
  TipoDevolucion,
} from '@/types/devolucion'

interface DevolucionApi {
  id: string
  venta: string
  usuario: string
  metodo_pago_reembolso?: string | null
  tipo: TipoDevolucion
  motivo: string
  estado: EstadoDevolucion
  total_devuelto: string | number
  fecha: string
  detalles?: Array<{
    id: string
    producto: string
    variante: string
    cantidad: number
    precio_original: string | number
    subtotal: string | number
  }>
}

function mapDevolucion(item: DevolucionApi): Devolucion {
  return {
    id: item.id,
    ventaFolio: item.venta,
    usuario: item.usuario,
    metodoPagoReembolso: item.metodo_pago_reembolso ?? 'No especificado',
    tipo: item.tipo,
    motivo: item.motivo,
    estado: item.estado,
    totalDevuelto: Number(item.total_devuelto ?? 0),
    fecha: item.fecha,
    productos: (item.detalles ?? []).map((detail) => ({
      id: detail.id,
      producto: detail.producto,
      variante: detail.variante,
      cantidad: Number(detail.cantidad),
      precioOriginal: Number(detail.precio_original),
      subtotal: Number(detail.subtotal),
    })),
  }
}

export async function getDevoluciones(): Promise<Devolucion[]> {
  const { data } = await api.get('/devoluciones/')
  return unwrapList<DevolucionApi>(data).map(mapDevolucion)
}

export async function getDevolucion(id: string): Promise<Devolucion> {
  const { data } = await api.get(`/devoluciones/${id}/`)
  return mapDevolucion(unwrapData<DevolucionApi>(data))
}

export async function createDevolucion(payload: DevolucionPayload): Promise<Devolucion> {
  const { data } = await api.post('/devoluciones/', payload)
  return mapDevolucion(unwrapData<DevolucionApi>(data))
}

export async function updateDevolucion(
  id: string,
  payload: Partial<{
    tipo: TipoDevolucion
    motivo: string
    metodo_pago_reembolso_id: string
  }>,
): Promise<Devolucion> {
  const { data } = await api.put(`/devoluciones/${id}/`, payload)
  return mapDevolucion(unwrapData<DevolucionApi>(data))
}

export async function aprobarDevolucion(id: string): Promise<Devolucion> {
  const { data } = await api.post(`/devoluciones/${id}/aprobar/`)
  return mapDevolucion(unwrapData<DevolucionApi>(data))
}

export async function rechazarDevolucion(id: string): Promise<Devolucion> {
  const { data } = await api.post(`/devoluciones/${id}/rechazar/`)
  return mapDevolucion(unwrapData<DevolucionApi>(data))
}
