import api from './axios'
import type { Variante } from '@/types/variante'

export async function obtenerVariantePorCodigo(codigo: string): Promise<Variante> {
  const { data } = await api.get<Variante>(`/variantes/codigo/${encodeURIComponent(codigo)}/`)

  return data
}
