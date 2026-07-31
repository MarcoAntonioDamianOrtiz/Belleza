import api from './axios'

import type {
  MovimientoInventario,
  MovimientoPayload,
  MovimientoResultado,
} from '@/types/inventario'

interface MovimientoApi {
  id: string
  variante: string
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  cantidad: number
  observaciones?: string | null
  usuario: string
  fecha: string
}

function mapMovimiento(item: MovimientoApi): MovimientoInventario {
  return {
    id: item.id,
    variante: item.variante,
    tipo: item.tipo,
    cantidad: Number(item.cantidad),
    observaciones: item.observaciones ?? '',
    usuario: item.usuario,
    fecha: item.fecha,
  }
}

export async function getMovimientosInventario(): Promise<MovimientoInventario[]> {
  const { data } = await api.get<MovimientoApi[]>('/inventario/')
  return data
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
  const { data } = await api.post<MovimientoResultado>('/inventario/ajuste/', payload)
  return data
}
