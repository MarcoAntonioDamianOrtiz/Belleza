import api from './axios'

import { unwrapData } from '@/utils/apiResponse'

import type { ReporteClave, ReporteFila } from '@/types/reporte'

export async function getReporte(
  tipo: ReporteClave,
  params?: Record<string, string>,
): Promise<ReporteFila[]> {
  const { data } = await api.get<ReporteFila[] | { data: ReporteFila[] }>(`/reportes/${tipo}/`, {
    params,
  })

  return unwrapData(data)
}
