import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { CarritoItem, VarianteVenta } from '@/types/venta'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref<CarritoItem[]>([])
  const descuento = ref(0)
  const ivaPorcentaje = ref(0)

  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + item.variante.precioMenudeo * item.cantidad, 0),
  )

  const descuentoAplicado = computed(() => Math.min(Math.max(0, descuento.value), subtotal.value))

  const baseConDescuento = computed(() => Math.max(0, subtotal.value - descuentoAplicado.value))

  const iva = computed(() => baseConDescuento.value * (ivaPorcentaje.value / 100))

  const total = computed(() => baseConDescuento.value + iva.value)

  const totalArticulos = computed(() => items.value.reduce((sum, item) => sum + item.cantidad, 0))

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

  function incrementar(varianteId: string) {
    const item = items.value.find((current) => current.variante.id === varianteId)

    if (!item || item.cantidad >= item.variante.stock) return
    item.cantidad += 1
  }

  function disminuir(varianteId: string) {
    const item = items.value.find((current) => current.variante.id === varianteId)

    if (!item) return

    if (item.cantidad <= 1) {
      eliminar(varianteId)
      return
    }

    item.cantidad -= 1
  }

  function eliminar(varianteId: string) {
    items.value = items.value.filter((item) => item.variante.id !== varianteId)
  }

  function vaciar() {
    items.value = []
    descuento.value = 0
  }

  return {
    items,
    descuento,
    ivaPorcentaje,
    subtotal,
    descuentoAplicado,
    iva,
    total,
    totalArticulos,
    agregar,
    incrementar,
    disminuir,
    eliminar,
    vaciar,
  }
})
