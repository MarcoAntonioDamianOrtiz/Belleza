import api from './axios'

import type { AbrirCajaPayload, Caja, CerrarCajaPayload, CorteCaja } from '@/types/caja'
import type { ApiResponse } from '@/types/api'

interface CajaApi {
  id: string
  nombre: string
  estado: 'ABIERTA' | 'CERRADA'
  activa: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

interface CorteApi {
  id: string
  caja: string
  usuario: string
  fecha_inicio: string
  fecha_fin?: string | null
  efectivo_inicial: string | number
  efectivo_final?: string | number | null
  diferencia?: string | number | null
}

function mapCaja(item: CajaApi): Caja {
  return {
    id: item.id,
    nombre: item.nombre,
    estado: item.estado,
    activa: item.activa,
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

function mapCorte(item: CorteApi): CorteCaja {
  return {
    id: item.id,
    caja: item.caja,
    usuario: item.usuario,
    fechaInicio: item.fecha_inicio,
    fechaFin: item.fecha_fin ?? null,
    efectivoInicial: Number(item.efectivo_inicial),
    efectivoFinal:
      item.efectivo_final === null || item.efectivo_final === undefined
        ? null
        : Number(item.efectivo_final),
    diferencia:
      item.diferencia === null || item.diferencia === undefined ? null : Number(item.diferencia),
  }
}

export async function getCajas(): Promise<Caja[]> {
  const { data } = await api.get<ApiResponse<CajaApi[]>>('/cajas/')
  return data.data.map(mapCaja)
}

export async function getCajasActivas(): Promise<Caja[]> {
  const { data } = await api.get<
    ApiResponse<
      Array<{
        id: string
        nombre: string
        estado: 'ABIERTA' | 'CERRADA'
      }>
    >
  >('/cajas/activas/')

  return data.data.map((item) => ({
    ...item,
    activa: true,
  }))
}

export async function createCaja(nombre: string): Promise<string> {
  const { data } = await api.post<ApiResponse<{ id: string }>>('/cajas/', {
    nombre,
    estado: 'CERRADA',
    activa: true,
  })

  return data.data.id
}

export async function abrirCaja(payload: AbrirCajaPayload) {
  const { data } = await api.post<
    ApiResponse<{
      corte_id: string
      fecha_inicio: string
    }>
  >('/caja/abrir/', payload)

  return data
}

export async function cerrarCaja(payload: CerrarCajaPayload) {
  const { data } = await api.post<
    ApiResponse<{
      corte_id: string
      efectivo_esperado: string | number
      efectivo_contado: string | number
      diferencia: string | number
    }>
  >('/caja/cerrar/', payload)

  return {
    ...data,
    data: {
      corteId: data.data.corte_id,
      efectivoEsperado: Number(data.data.efectivo_esperado),
      efectivoContado: Number(data.data.efectivo_contado),
      diferencia: Number(data.data.diferencia),
    },
  }
}

export async function getCorteActivo(): Promise<CorteCaja> {
  const { data } = await api.get<ApiResponse<CorteApi>>('/caja/corte/activo/')
  return mapCorte(data.data)
}

export async function getHistorialCortes(cajaId: string): Promise<CorteCaja[]> {
  const { data } = await api.get<ApiResponse<CorteApi[]>>(`/caja/cajas/${cajaId}/cortes/`)

  return data.data.map(mapCorte)
}
