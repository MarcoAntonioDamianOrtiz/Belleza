<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import { loadInventoryCatalog } from './inventarioData'
import { getFriendlyError } from '@/utils/apiError'
import { showError } from '@/utils/notifications'

import type { CatalogVariant } from './inventarioData'

const search = ref('')
const loading = ref(false)
const inventario = ref<CatalogVariant[]>([])

const filteredInventory = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return inventario.value

  return inventario.value.filter((item) =>
    [item.producto, item.variante, item.sku, item.codigoBarras].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

function getStockStatus(item: CatalogVariant) {
  if (item.stock <= 0) {
    return { status: 'danger' as const, label: 'Agotado' }
  }

  if (item.stock <= item.stockMinimo) {
    return { status: 'warning' as const, label: 'Stock bajo' }
  }

  return { status: 'success' as const, label: 'Disponible' }
}

async function loadData() {
  loading.value = true

  try {
    inventario.value = await loadInventoryCatalog()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar el inventario.'))
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Inventario' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Inventario</h1>
      <p class="mt-1 text-sm text-gray-500">Consulta el stock y administra los movimientos.</p>
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

    <BaseLoader v-if="loading" text="Cargando inventario..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">SKU</th>
              <th class="px-5 py-4">Código</th>
              <th class="px-5 py-4">Stock</th>
              <th class="px-5 py-4">Mínimo</th>
              <th class="px-5 py-4">Estado</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filteredInventory" :key="item.id" class="hover:bg-gray-50">
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.producto }}
              </td>
              <td class="px-5 py-4 text-gray-600">{{ item.variante }}</td>
              <td class="px-5 py-4 text-gray-600">{{ item.sku }}</td>
              <td class="px-5 py-4 font-mono text-xs text-gray-600">
                {{ item.codigoBarras }}
              </td>
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.stock }}
              </td>
              <td class="px-5 py-4 text-gray-600">{{ item.stockMinimo }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="getStockStatus(item).status"
                  :label="getStockStatus(item).label"
                />
              </td>
            </tr>

            <tr v-if="!filteredInventory.length">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No se encontraron productos.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
