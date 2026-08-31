import type { AxiosResponse } from 'axios'

import api from './axios'

import type { ReporteClave, ReporteFila } from '@/types/reporte'

interface PaginatedReportResponse {
  count?: number
  next?: string | null
  previous?: string | null
  results?: ReporteFila[]
  data?: ReporteFila[]
}

const REPORT_ENDPOINTS: Record<ReporteClave, string> = {
  ventas: '/reportes/ventas/',
  inventario: '/reportes/inventario/',
  'stock-bajo': '/reportes/stock-bajo/',
  cortes: '/reportes/cortes/',
  productos: '/reportes/productos/',
  devoluciones: '/reportes/devoluciones/',
  garantias: '/reportes/garantias/',
  movimientos: '/reportes/movimientos/',
}

function extractRows(response: PaginatedReportResponse | ReporteFila[]): ReporteFila[] {
  if (Array.isArray(response)) return response
  if (Array.isArray(response.results)) return response.results
  if (Array.isArray(response.data)) return response.data
  return []
}

export async function getReporte(
  tipo: ReporteClave,
  params?: Record<string, string>,
): Promise<ReporteFila[]> {
  const endpoint = REPORT_ENDPOINTS[tipo]
  const rows: ReporteFila[] = []

  let nextUrl: string | null = endpoint
  let firstRequest = true
  let safetyCounter = 0

  while (nextUrl && safetyCounter < 100) {
    const response: AxiosResponse<PaginatedReportResponse | ReporteFila[]> = await api.get(
      nextUrl,
      {
        params: firstRequest ? params : undefined,
      },
    )

    const body: PaginatedReportResponse | ReporteFila[] = response.data

    rows.push(...extractRows(body))

    nextUrl =
      !Array.isArray(body) && typeof body === 'object' && body !== null
        ? (body.next ?? null)
        : null

    firstRequest = false
    safetyCounter += 1
  }

  return rows
}
