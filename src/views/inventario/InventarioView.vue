<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

interface InventarioItem {
  id: number
  producto: string
  variante: string
  sku: string
  codigoBarras: string
  stock: number
}

const search = ref('')

const inventario = ref<InventarioItem[]>([
  {
    id: 1,
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    codigoBarras: '7501234567890',
    stock: 24,
  },
  {
    id: 2,
    producto: 'Labial Mate',
    variante: 'Rosa Nude',
    sku: 'LAB-MAT-NUD',
    codigoBarras: '7501234567891',
    stock: 4,
  },
  {
    id: 3,
    producto: 'Labial Mate',
    variante: 'Ciruela',
    sku: 'LAB-MAT-CIR',
    codigoBarras: '7501234567892',
    stock: 0,
  },
])

const filteredInventory = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return inventario.value

  return inventario.value.filter((item) =>
    [item.producto, item.variante, item.sku, item.codigoBarras].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      status: 'danger' as const,
      label: 'Agotado',
    }
  }

  if (stock <= 5) {
    return {
      status: 'warning' as const,
      label: 'Stock bajo',
    }
  }

  return {
    status: 'success' as const,
    label: 'Disponible',
  }
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Inventario' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Inventario</h1>

      <p class="mt-1 text-sm text-gray-500">
        Consulta el stock y administra los movimientos de inventario.
      </p>
    </div>

    <div class="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink to="/inventario/entradas">
        <BaseButton variant="secondary" class="w-full">
          <ArrowDownTrayIcon class="h-5 w-5" />
          Entradas
        </BaseButton>
      </RouterLink>

      <RouterLink to="/inventario/salidas">
        <BaseButton variant="secondary" class="w-full">
          <ArrowUpTrayIcon class="h-5 w-5" />
          Salidas
        </BaseButton>
      </RouterLink>

      <RouterLink to="/inventario/ajustes">
        <BaseButton variant="secondary" class="w-full">
          <AdjustmentsHorizontalIcon class="h-5 w-5" />
          Ajustes
        </BaseButton>
      </RouterLink>

      <RouterLink to="/inventario/historial">
        <BaseButton variant="secondary" class="w-full">
          <ClockIcon class="h-5 w-5" />
          Historial
        </BaseButton>
      </RouterLink>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o código..." />
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">SKU</th>
              <th class="px-5 py-4">Código</th>
              <th class="px-5 py-4">Stock</th>
              <th class="px-5 py-4">Estado</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in filteredInventory"
              :key="item.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.producto }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ item.variante }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ item.sku }}
              </td>

              <td class="px-5 py-4 font-mono text-xs text-gray-600">
                {{ item.codigoBarras }}
              </td>

              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.stock }}
              </td>

              <td class="px-5 py-4">
                <StatusChip
                  :status="getStockStatus(item.stock).status"
                  :label="getStockStatus(item.stock).label"
                />
              </td>
            </tr>

            <tr v-if="!filteredInventory.length">
              <td colspan="6" class="px-6 py-12 text-center">
                <p class="font-medium text-gray-900">No se encontraron productos</p>

                <p class="mt-1 text-sm text-gray-500">Intenta realizar otra búsqueda.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
