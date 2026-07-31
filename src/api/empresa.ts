import api from './axios'

import type { Empresa, EmpresaPayload } from '@/types/empresa'
import type { ApiResponse } from '@/types/api'

interface EmpresaApi {
  id: string
  nombre: string
  rfc?: string | null
  direccion: string
  telefono?: string | null
  logo?: string | null
  mensaje_ticket: string
  iva: string | number
  dias_devolucion: number
  fecha_creacion?: string
  fecha_actualizacion?: string
}

function mapEmpresa(item: EmpresaApi): Empresa {
  return {
    id: item.id,
    nombre: item.nombre,
    rfc: item.rfc ?? '',
    direccion: item.direccion,
    telefono: item.telefono ?? '',
    logo: item.logo ?? '',
    mensajeTicket: item.mensaje_ticket,
    iva: Number(item.iva),
    diasDevolucion: Number(item.dias_devolucion),
    fechaCreacion: item.fecha_creacion,
    fechaActualizacion: item.fecha_actualizacion,
  }
}

export async function getEmpresa(): Promise<Empresa> {
  const { data } = await api.get<ApiResponse<EmpresaApi>>('/empresa')
  return mapEmpresa(data.data)
}

export async function createEmpresa(payload: EmpresaPayload): Promise<Empresa> {
  const { data } = await api.post<ApiResponse<EmpresaApi>>('/empresa', payload)
  return mapEmpresa(data.data)
}

export async function updateEmpresa(payload: EmpresaPayload): Promise<Empresa> {
  const { data } = await api.put<ApiResponse<EmpresaApi>>('/empresa', payload)
  return mapEmpresa(data.data)
}
