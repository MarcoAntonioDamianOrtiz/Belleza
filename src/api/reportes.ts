import api from './axios'
import { getAllPages, getBackendPage } from './pagination'

import type { ReporteClave, ReporteFila, ResumenDia } from '@/types/reporte'

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


export async function getReportePage(
  tipo: ReporteClave,
  params: Record<string, string> = {},
  page = 1,
  pageSize = 10,
) {
  return getBackendPage<ReporteFila>(api, REPORT_ENDPOINTS[tipo], {
    page,
    pageSize,
    params,
  })
}

export async function getReporte(
  tipo: ReporteClave,
  params?: Record<string, string>,
): Promise<ReporteFila[]> {
  return getAllPages<ReporteFila>(api, REPORT_ENDPOINTS[tipo], {
    ...params,
    page_size: 200,
  })
}


interface ResumenDiaApi {
  fecha: string
  cantidad_ventas: number
  subtotal: string | number
  descuento: string | number
  iva: string | number
  total_vendido: string | number
  reembolsos: string | number
  venta_neta: string | number
  metodos_pago: Record<string, string | number>
  reembolsos_por_metodo: Record<string, string | number>
}

function mapMoneyRecord(values: Record<string, string | number>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Number(value)]),
  )
}

export async function getResumenDia(fecha?: string): Promise<ResumenDia> {
  const { data } = await api.get<{ success: boolean; data: ResumenDiaApi }>(
    '/reportes/resumen-dia/',
    { params: fecha ? { fecha } : undefined },
  )

  const item = data.data

  return {
    fecha: item.fecha,
    cantidadVentas: Number(item.cantidad_ventas ?? 0),
    subtotal: Number(item.subtotal ?? 0),
    descuento: Number(item.descuento ?? 0),
    iva: Number(item.iva ?? 0),
    totalVendido: Number(item.total_vendido ?? 0),
    reembolsos: Number(item.reembolsos ?? 0),
    ventaNeta: Number(item.venta_neta ?? 0),
    metodosPago: mapMoneyRecord(item.metodos_pago ?? {}),
    reembolsosPorMetodo: mapMoneyRecord(item.reembolsos_por_metodo ?? {}),
  }
}
