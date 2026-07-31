import api from './axios'

import { unwrapData } from '@/utils/apiResponse'

import type {
  EstadoGarantia,
  Garantia,
  GarantiaPayload,
  ResolucionGarantia,
} from '@/types/garantia'

interface GarantiaApi {
  id: string
  venta_id?: string
  venta?: string | { id?: string; folio?: string }
  venta_folio?: string
  usuario?: string | { nombre?: string }
  variante_id?: string
  variante?: string | { id?: string; nombre?: string; producto?: string }
  producto?: string
  motivo: string
  estado: EstadoGarantia
  resolucion?: ResolucionGarantia | null
  observaciones?: string | null
  fecha: string
  fecha_actualizacion?: string
}

function mapGarantia(item: GarantiaApi): Garantia {
  const ventaObject = typeof item.venta === 'object' && item.venta !== null ? item.venta : null

  const varianteObject =
    typeof item.variante === 'object' && item.variante !== null ? item.variante : null

  const usuario =
    typeof item.usuario === 'object'
      ? (item.usuario?.nombre ?? 'Usuario')
      : (item.usuario ?? 'Usuario')

  return {
    id: item.id,
    ventaId: item.venta_id ?? ventaObject?.id ?? (typeof item.venta === 'string' ? item.venta : ''),
    ventaFolio:
      item.venta_folio ?? ventaObject?.folio ?? (typeof item.venta === 'string' ? item.venta : '—'),
    usuario,
    varianteId: item.variante_id ?? varianteObject?.id ?? '',
    producto: item.producto ?? varianteObject?.producto ?? 'Producto',
    variante:
      varianteObject?.nombre ?? (typeof item.variante === 'string' ? item.variante : 'Variante'),
    motivo: item.motivo,
    estado: item.estado,
    resolucion: item.resolucion ?? null,
    observaciones: item.observaciones ?? '',
    fecha: item.fecha,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getGarantias(): Promise<Garantia[]> {
  const { data } = await api.get<GarantiaApi[] | { data: GarantiaApi[] }>('/garantias/')

  return unwrapData(data).map(mapGarantia)
}

export async function getGarantia(id: string): Promise<Garantia> {
  const { data } = await api.get<GarantiaApi | { data: GarantiaApi }>(`/garantias/${id}/`)

  return mapGarantia(unwrapData(data))
}

export async function createGarantia(payload: GarantiaPayload): Promise<unknown> {
  const { data } = await api.post('/garantias/', payload)
  return data
}

export async function updateGarantia(
  id: string,
  payload: Partial<{
    estado: EstadoGarantia
    resolucion: ResolucionGarantia
    observaciones: string
  }>,
): Promise<unknown> {
  const { data } = await api.put(`/garantias/${id}/`, payload)
  return data
}

export async function aprobarGarantia(
  id: string,
  payload: {
    resolucion: ResolucionGarantia
    observaciones?: string
  },
): Promise<unknown> {
  const { data } = await api.post(`/garantias/${id}/aprobar/`, payload)
  return data
}

export async function rechazarGarantia(id: string, observaciones = ''): Promise<unknown> {
  const { data } = await api.post(`/garantias/${id}/rechazar/`, { observaciones })
  return data
}

export async function finalizarGarantia(id: string): Promise<unknown> {
  const { data } = await api.post(`/garantias/${id}/finalizar/`)
  return data
}
