import { getVariante, getVariantes } from '@/api/variantes'
import { getVenta, getVentas } from '@/api/ventas'
import { formatDate } from '@/utils/formatDate'

import type { Variante } from '@/types/variante'
import type { VentaDetalle, VentaResumen } from '@/types/venta'

export interface VentaOption {
  label: string
  value: string
}

export interface SoldVariantOption {
  label: string
  value: string
  detalleVentaId: string
  cantidadVendida: number
  cantidadDisponible: number
  garantiaMeses: number | null
  garantiaConocida: boolean
}

export interface VentaCatalog {
  ventas: VentaResumen[]
  variantes: Variante[]
}

export async function loadVentaCatalog(): Promise<VentaCatalog> {
  const [ventas, variantes] = await Promise.all([getVentas(), getVariantes()])
  return { ventas, variantes }
}

export function buildVentaOptions(ventas: VentaResumen[]): VentaOption[] {
  return ventas
    .filter((venta) => venta.estado !== 'CANCELADA')
    .map((venta) => ({
      label: `${venta.folio} · ${formatDate(venta.fecha)} · ${venta.usuario}`,
      value: venta.id,
    }))
}

export async function loadSoldVariantOptions(
  ventaId: string,
): Promise<{ detalle: VentaDetalle; opciones: SoldVariantOption[] }> {
  const detalle = await getVenta(ventaId)

  const opciones = await Promise.all(detalle.productos
    .filter((linea) => linea.cantidadDisponible > 0)
    .map(async (linea) => {
      const variante = await getVariante(linea.varianteId).catch(() => null)
      return {
        value: linea.varianteId,
        detalleVentaId: linea.detalleId,
        label: `${linea.producto} - ${linea.variante} · ${linea.cantidadDisponible} disponibles`,
        cantidadVendida: linea.cantidad,
        cantidadDisponible: linea.cantidadDisponible,
        garantiaMeses: variante?.garantiaMeses ?? null,
        garantiaConocida: Boolean(variante),
      }
    }))

  return { detalle, opciones }
}
