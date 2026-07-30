import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { CarritoItem, TipoPrecio, VarianteVenta } from '@/types/venta'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref<CarritoItem[]>([])
  const tipoPrecio = ref<TipoPrecio>('menudeo')
  const descuentoPorcentaje = ref(0)
  const ivaPorcentaje = ref(16)

  function precioUnitario(item: CarritoItem): number {
    return tipoPrecio.value === 'mayoreo'
      ? item.variante.precioMayoreo
      : item.variante.precioMenudeo
  }

  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + precioUnitario(item) * item.cantidad, 0),
  )

  const descuentoMonto = computed(() => subtotal.value * (descuentoPorcentaje.value / 100))

  const baseConDescuento = computed(() => Math.max(0, subtotal.value - descuentoMonto.value))

  const iva = computed(() => baseConDescuento.value * (ivaPorcentaje.value / 100))

  const total = computed(() => baseConDescuento.value + iva.value)

  const totalArticulos = computed(() =>
    items.value.reduce((total, item) => total + item.cantidad, 0),
  )

  function agregar(variante: VarianteVenta) {
    const existente = items.value.find((item) => item.variante.id === variante.id)

    if (existente) {
      if (existente.cantidad < variante.stock) {
        existente.cantidad += 1
      }
      return
    }

    if (variante.stock > 0) {
      items.value.push({
        variante,
        cantidad: 1,
      })
    }
  }

  function actualizarCantidad(varianteId: number, cantidad: number) {
    const item = items.value.find((current) => current.variante.id === varianteId)

    if (!item) return

    if (cantidad <= 0) {
      eliminar(varianteId)
      return
    }

    item.cantidad = Math.min(cantidad, item.variante.stock)
  }

  function incrementar(varianteId: number) {
    const item = items.value.find((current) => current.variante.id === varianteId)

    if (!item || item.cantidad >= item.variante.stock) return
    item.cantidad += 1
  }

  function disminuir(varianteId: number) {
    const item = items.value.find((current) => current.variante.id === varianteId)

    if (!item) return

    if (item.cantidad <= 1) {
      eliminar(varianteId)
      return
    }

    item.cantidad -= 1
  }

  function eliminar(varianteId: number) {
    items.value = items.value.filter((item) => item.variante.id !== varianteId)
  }

  function vaciar() {
    items.value = []
    descuentoPorcentaje.value = 0
    tipoPrecio.value = 'menudeo'
  }

  return {
    items,
    tipoPrecio,
    descuentoPorcentaje,
    ivaPorcentaje,
    subtotal,
    descuentoMonto,
    iva,
    total,
    totalArticulos,
    precioUnitario,
    agregar,
    actualizarCantidad,
    incrementar,
    disminuir,
    eliminar,
    vaciar,
  }
})
