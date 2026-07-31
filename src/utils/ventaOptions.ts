import { getProductos } from '@/api/productos'
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
  cantidadVendida: number
  garantiaMeses: number | null
}

export interface VentaCatalog {
  ventas: VentaResumen[]
  variantes: Variante[]
  productoNombrePorId: Map<string, string>
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('es-MX')
}

export async function loadVentaCatalog(): Promise<VentaCatalog> {
  const [ventas, productos, variantes] = await Promise.all([
    getVentas(),
    getProductos(),
    getVariantes(),
  ])

  return {
    ventas,
    variantes,
    productoNombrePorId: new Map(productos.map((item) => [item.id, item.nombre])),
  }
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

  const opciones = detalle.productos
    .map((linea) => {
      const variante = catalog.variantes.find((item) => {
        const producto = catalog.productoNombrePorId.get(item.productoId) ?? ''

        return (
          normalize(producto) === normalize(linea.producto) &&
          normalize(item.nombre) === normalize(linea.variante)
        )
      })

      if (!variante) return null

      return {
        value: variante.id,
        label: `${linea.producto} - ${linea.variante} · ${linea.cantidad} vendidos`,
        cantidadVendida: linea.cantidad,
        garantiaMeses: variante.garantiaMeses,
      }
    })
    .filter((item): item is SoldVariantOption => item !== null)

  return { detalle, opciones }
}
