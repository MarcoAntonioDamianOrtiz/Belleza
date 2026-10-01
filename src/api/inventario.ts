import api from './axios'
import { getAllPages, getBackendPage } from './pagination'

import type {
  MovimientoInventario,
  MovimientoPayload,
  MovimientoResultado,
} from '@/types/inventario'

interface MovimientoApi {
  id: string
  variante: string
  variante_id?: string
  producto_nombre?: string
  sku?: string
  tipo: MovimientoInventario['tipo']
  stock_anterior?: number
  stock_nuevo?: number
  stock_defectuoso_anterior?: number
  stock_defectuoso_nuevo?: number
  cantidad: number
  observaciones?: string | null
  usuario: string
  fecha: string
}

function mapMovimiento(item: MovimientoApi): MovimientoInventario {
  return {
    id: item.id,
    variante: item.variante,
    varianteId: item.variante_id,
    productoNombre: item.producto_nombre,
    sku: item.sku,
    stockAnterior: item.stock_anterior,
    stockNuevo: item.stock_nuevo,
    stockDefectuosoAnterior: item.stock_defectuoso_anterior,
    stockDefectuosoNuevo: item.stock_defectuoso_nuevo,
    tipo: item.tipo,
    cantidad: Number(item.cantidad),
    observaciones: item.observaciones ?? '',
    usuario: item.usuario,
    fecha: item.fecha,
  }
}

export async function getMovimientosInventario(): Promise<MovimientoInventario[]> {
  const items = await getAllPages<MovimientoApi>(api, '/inventario/', { page_size: 200 })
  return items
    .map(mapMovimiento)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export async function registrarEntrada(payload: MovimientoPayload): Promise<MovimientoResultado> {
  const { data } = await api.post<MovimientoResultado>('/inventario/entrada/', payload)
  return data
}

export async function registrarSalida(payload: MovimientoPayload): Promise<MovimientoResultado> {
  const { data } = await api.post<MovimientoResultado>('/inventario/salida/', payload)
  return data
}

export async function registrarAjuste(payload: MovimientoPayload): Promise<MovimientoResultado> {
  const { data } = await api.post<MovimientoResultado>('/inventario/ajuste/', {
    variante_id: payload.variante_id,
    stock_nuevo: payload.cantidad,
    observaciones: payload.observaciones,
  })
  return data
}

export async function getMovimientosInventarioPage(
  page = 1,
  pageSize = 50,
  filtros?: { tipo?: MovimientoInventario['tipo']; variante_id?: string; search?: string; fecha_desde?: string; fecha_hasta?: string },
) {
  const result = await getBackendPage<MovimientoApi>(api, '/inventario/', {
    page,
    pageSize,
    params: { ...filtros, search: filtros?.search?.slice(0, 100) },
  })
  return { ...result, items: result.items.map(mapMovimiento) }
}
