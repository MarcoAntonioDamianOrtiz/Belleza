import api from './axios'

import { unwrapList } from '@/utils/apiResponse'

import type { ReporteClave, ReporteFila } from '@/types/reporte'

export async function getReporte(
  tipo: ReporteClave,
  params?: Record<string, string>,
): Promise<ReporteFila[]> {
  const { data } = await api.get(`/reportes/${tipo}/`, { params })

  return unwrapList<ReporteFila>(data)
}
