import api from './axios'

import { unwrapData } from '@/utils/apiResponse'

import type { BitacoraRegistro } from '@/types/bitacora'

interface BitacoraApi {
  id: string
  modulo: string
  accion: string
  descripcion: string
  usuario?: string | { nombre?: string }
  fecha: string
}

export async function getBitacora(): Promise<BitacoraRegistro[]> {
  const { data } = await api.get<BitacoraApi[] | { data: BitacoraApi[] }>('/bitacora/')

  return unwrapData(data).map((item) => ({
    id: item.id,
    modulo: item.modulo,
    accion: item.accion,
    descripcion: item.descripcion,
    usuario:
      typeof item.usuario === 'object'
        ? (item.usuario?.nombre ?? 'Usuario')
        : (item.usuario ?? 'Usuario'),
    fecha: item.fecha,
  }))
}
