import { getVariantes } from '@/api/variantes'
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
  garantiaMeses: number | null
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
  catalog: VentaCatalog,
): Promise<{ detalle: VentaDetalle; opciones: SoldVariantOption[] }> {
  const detalle = await getVenta(ventaId)

  const opciones = detalle.productos.map((linea) => {
    const variante = catalog.variantes.find((item) => item.id === linea.varianteId)

    return {
      value: linea.varianteId,
      detalleVentaId: linea.detalleId,
      label: `${linea.producto} - ${linea.variante} · ${linea.cantidad} vendidos`,
      cantidadVendida: linea.cantidad,
      garantiaMeses: variante?.garantiaMeses ?? null,
    }
  })

  return { detalle, opciones }
}
