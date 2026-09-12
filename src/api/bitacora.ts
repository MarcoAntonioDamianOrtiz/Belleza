import api from './axios'
import { getAllPages, getBackendPage } from './pagination'

import type { BitacoraRegistro } from '@/types/bitacora'

interface BitacoraApi {
  id: string
  modulo: string
  accion: string
  descripcion: string
  usuario?: string | { nombre?: string }
  fecha: string
}

function mapBitacora(item: BitacoraApi): BitacoraRegistro {
  return {
    id: item.id,
    modulo: item.modulo,
    accion: item.accion,
    descripcion: item.descripcion,
    usuario:
      typeof item.usuario === 'object'
        ? (item.usuario?.nombre ?? 'Usuario')
        : (item.usuario ?? 'Usuario'),
    fecha: item.fecha,
  }
}

export async function getBitacora(
  params?: Record<string, string | number | boolean | undefined>,
): Promise<BitacoraRegistro[]> {
  const items = await getAllPages<BitacoraApi>(api, '/bitacora/', {
    page_size: 200,
    ...params,
  })

  return items.map(mapBitacora)
}

export async function getBitacoraPage(
  page = 1,
  pageSize = 10,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const result = await getBackendPage<BitacoraApi>(api, '/bitacora/', {
    page,
    pageSize,
    params,
  })

  return {
    ...result,
    items: result.items.map(mapBitacora),
  }
}
