import api from './axios'

import type {
  EstadoVenta,
  VentaCreateResult,
  VentaDetalle,
  TicketResultado,
  VentaPayload,
  VentaResumen,
} from '@/types/venta'
import type { ApiResponse } from '@/types/api'

interface VentaResumenApi {
  id: string
  folio: string
  fecha: string
  usuario: string
  total: string | number
  estado: EstadoVenta
}

interface VentaDetalleApi {
  id: string
  folio: string
  fecha: string
  usuario: string
  metodo_pago: string
  caja: string
  subtotal: string | number
  descuento?: string | number
  iva: string | number
  total: string | number
  estado: EstadoVenta
  productos: Array<{
    producto: string
    variante: string
    cantidad: number
    precio_unitario: string | number
    subtotal: string | number
  }>
}

export async function createVenta(payload: VentaPayload): Promise<VentaCreateResult> {
  const { data } = await api.post<VentaCreateResult>('/ventas/', payload)
  return data
}

export async function getVentas(): Promise<VentaResumen[]> {
  const { data } = await api.get<ApiResponse<VentaResumenApi[]>>('/ventas/')

  return data.data
    .map((item) => ({
      id: item.id,
      folio: item.folio,
      fecha: item.fecha,
      usuario: item.usuario,
      total: Number(item.total),
      estado: item.estado,
    }))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export async function getVenta(id: string): Promise<VentaDetalle> {
  const { data } = await api.get<ApiResponse<VentaDetalleApi>>(`/ventas/${id}/`)
  const item = data.data

  return {
    id: item.id,
    folio: item.folio,
    fecha: item.fecha,
    usuario: item.usuario,
    metodoPago: item.metodo_pago,
    caja: item.caja,
    subtotal: Number(item.subtotal),
    descuento: Number(item.descuento ?? 0),
    iva: Number(item.iva),
    total: Number(item.total),
    estado: item.estado,
    productos: item.productos.map((product) => ({
      producto: product.producto,
      variante: product.variante,
      cantidad: Number(product.cantidad),
      precioUnitario: Number(product.precio_unitario),
      subtotal: Number(product.subtotal),
    })),
  }
}

export async function cancelVenta(id: string): Promise<string> {
  const { data } = await api.post<{ success: boolean; message: string }>(`/ventas/${id}/cancelar/`)
  return data.message
}

interface TicketApi {
  empresa?: {
    nombre?: string
    telefono?: string | null
    direccion?: string | null
    rfc?: string | null
    mensaje_ticket?: string | null
  }
  venta?: {
    folio?: string
    fecha?: string
    metodo_pago?: string
  }
  usuario?: {
    nombre?: string
  }
  productos?: Array<{
    producto?: string
    variante?: string
    cantidad?: number
    precio?: string | number
    precio_unitario?: string | number
    subtotal?: string | number
  }>
  totales?: {
    subtotal?: string | number
    descuento?: string | number
    iva?: string | number
    total?: string | number
  }
}

function mapTicket(id: string, response: { data?: TicketApi } | TicketApi): TicketResultado {
  const item: TicketApi =
    'data' in response && response.data ? response.data : (response as TicketApi)
  const venta = item.venta ?? {}
  const totals = item.totales ?? {}

  return {
    venta: {
      id,
      folio: venta.folio ?? 'Venta',
      fecha: venta.fecha ?? new Date().toISOString(),
      usuario: item.usuario?.nombre ?? 'Usuario',
      metodoPago: venta.metodo_pago ?? 'No especificado',
      caja: '',
      subtotal: Number(totals.subtotal ?? 0),
      descuento: Number(totals.descuento ?? 0),
      iva: Number(totals.iva ?? 0),
      total: Number(totals.total ?? 0),
      estado: 'COMPLETADA',
      productos: (item.productos ?? []).map((product) => ({
        producto: product.producto ?? 'Producto',
        variante: product.variante ?? 'Variante',
        cantidad: Number(product.cantidad ?? 0),
        precioUnitario: Number(product.precio_unitario ?? product.precio ?? 0),
        subtotal: Number(product.subtotal ?? 0),
      })),
    },
    empresa: item.empresa
      ? {
          nombre: item.empresa.nombre ?? 'Belleza',
          telefono: item.empresa.telefono ?? '',
          direccion: item.empresa.direccion ?? '',
          rfc: item.empresa.rfc ?? '',
          mensajeTicket: item.empresa.mensaje_ticket ?? 'Gracias por su compra.',
        }
      : null,
  }
}

export async function getTicketVenta(id: string): Promise<TicketResultado> {
  const { data } = await api.get<{ data?: TicketApi } | TicketApi>(`/ventas/${id}/ticket/`)
  return mapTicket(id, data)
}

export async function reprintTicketVenta(id: string): Promise<TicketResultado> {
  const { data } = await api.get<{ data?: TicketApi } | TicketApi>(`/tickets/reimprimir/${id}/`)
  return mapTicket(id, data)
}
