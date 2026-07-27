<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

interface Movimiento {
  id: number
  fecha: string
  producto: string
  variante: string
  sku: string
  tipo: TipoMovimiento
  cantidad: number
  motivo: string
}

const search = ref('')
const typeFilter = ref<'todos' | TipoMovimiento>('todos')

const movimientos = ref<Movimiento[]>([
  {
    id: 1,
    fecha: '26/07/2026 14:20',
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    tipo: 'ajuste',
    cantidad: -2,
    motivo: 'Corrección por conteo físico',
  },
  {
    id: 2,
    fecha: '26/07/2026 12:45',
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    tipo: 'salida',
    cantidad: -2,
    motivo: 'Producto dañado',
  },
  {
    id: 3,
    fecha: '26/07/2026 10:30',
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    tipo: 'entrada',
    cantidad: 20,
    motivo: 'Compra a proveedor',
  },
  {
    id: 4,
    fecha: '25/07/2026 16:15',
    producto: 'Labial Mate',
    variante: 'Rosa Nude',
    sku: 'LAB-MAT-NUD',
    tipo: 'entrada',
    cantidad: 10,
    motivo: 'Compra a proveedor',
  },
])

const filteredMovements = computed(() => {
  const term = search.value.trim().toLowerCase()

  return movimientos.value.filter((movimiento) => {
    const matchesType = typeFilter.value === 'todos' || movimiento.tipo === typeFilter.value

    const matchesSearch =
      !term ||
      [movimiento.producto, movimiento.variante, movimiento.sku, movimiento.motivo].some((value) =>
        value.toLowerCase().includes(term),
      )

    return matchesType && matchesSearch
  })
})

function statusFor(type: TipoMovimiento) {
  if (type === 'entrada') {
    return {
      status: 'success' as const,
      label: 'Entrada',
    }
  }

  if (type === 'salida') {
    return {
      status: 'danger' as const,
      label: 'Salida',
    }
  }

  return {
    status: 'info' as const,
    label: 'Ajuste',
  }
}

function formatQuantity(quantity: number) {
  if (quantity > 0) {
    return `+${quantity}`
  }

  return String(quantity)
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Inventario', to: '/inventario' }, { label: 'Historial' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Historial de inventario</h1>

      <p class="mt-1 text-sm text-gray-500">
        Consulta los movimientos registrados en el inventario.
      </p>
    </div>

    <div class="mb-6">
      <RouterLink
        to="/inventario"
        class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#C56B86]"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Volver al inventario
      </RouterLink>
    </div>

    <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o motivo..." />
      </div>

      <select
        v-model="typeFilter"
        class="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      >
        <option value="todos">Todos los movimientos</option>

        <option value="entrada">Entradas</option>

        <option value="salida">Salidas</option>

        <option value="ajuste">Ajustes</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[950px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">SKU</th>
              <th class="px-5 py-4">Tipo</th>
              <th class="px-5 py-4">Cantidad</th>
              <th class="px-5 py-4">Motivo</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="movimiento in filteredMovements"
              :key="movimiento.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ movimiento.fecha }}
              </td>

              <td class="px-5 py-4 font-medium text-gray-900">
                {{ movimiento.producto }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ movimiento.variante }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ movimiento.sku }}
              </td>

              <td class="px-5 py-4">
                <StatusChip
                  :status="statusFor(movimiento.tipo).status"
                  :label="statusFor(movimiento.tipo).label"
                />
              </td>

              <td class="px-5 py-4">
                <span
                  :class="[
                    'font-semibold',
                    movimiento.cantidad > 0
                      ? 'text-green-600'
                      : movimiento.cantidad < 0
                        ? 'text-red-600'
                        : 'text-gray-600',
                  ]"
                >
                  {{ formatQuantity(movimiento.cantidad) }}
                </span>
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ movimiento.motivo }}
              </td>
            </tr>

            <tr v-if="!filteredMovements.length">
              <td colspan="7" class="px-6 py-12 text-center">
                <p class="font-medium text-gray-900">No se encontraron movimientos</p>

                <p class="mt-1 text-sm text-gray-500">Intenta cambiar la búsqueda o el filtro.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
