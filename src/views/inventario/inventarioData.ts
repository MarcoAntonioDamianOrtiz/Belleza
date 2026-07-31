import { getProductos } from '@/api/productos'
import { getVariantes } from '@/api/variantes'

import type { MovimientoInventario } from '@/types/inventario'

export interface CatalogVariant {
  id: string
  producto: string
  variante: string
  sku: string
  codigoBarras: string
  stock: number
  stockMinimo: number
}

export interface MovimientoVista extends MovimientoInventario {
  producto: string
  sku: string
}

export async function loadInventoryCatalog(): Promise<CatalogVariant[]> {
  const [productos, variantes] = await Promise.all([getProductos(), getVariantes()])

  const productMap = new Map(productos.map((item) => [item.id, item.nombre]))

  return variantes.map((item) => ({
    id: item.id,
    producto: productMap.get(item.productoId) ?? 'Producto',
    variante: item.nombre,
    sku: item.sku,
    codigoBarras: item.codigoBarras,
    stock: item.stock,
    stockMinimo: item.stockMinimo,
  }))
}

export function enrichMovements(
  movimientos: MovimientoInventario[],
  catalog: CatalogVariant[],
): MovimientoVista[] {
  return movimientos.map((item) => {
    const variant = catalog.find((current) => current.variante === item.variante)

    return {
      ...item,
      producto: variant?.producto ?? 'Producto',
      sku: variant?.sku ?? '—',
    }
  })
}
