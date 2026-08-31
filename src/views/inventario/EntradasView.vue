<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import MovimientoInventarioModal from './components/MovimientoInventarioModal.vue'

import { getMovimientosInventario, registrarEntrada } from '@/api/inventario'
import { enrichMovements, loadInventoryCatalog } from './inventarioData'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { useClientPagination } from '@/composables/useClientPagination'
import { showError, showSuccess } from '@/utils/notifications'

import type { MovimientoFormData } from './components/MovimientoInventarioForm.vue'
import type { CatalogVariant, MovimientoVista } from './inventarioData'

const search = ref('')
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const catalog = ref<CatalogVariant[]>([])
const movimientos = ref<MovimientoVista[]>([])

const variantesOptions = computed(() =>
  catalog.value.map((item) => ({
    value: item.id,
    label: `${item.producto} - ${item.variante}`,
    stock: item.stock,
  })),
)

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return movimientos.value
    .filter((item) => item.tipo === 'ENTRADA')
    .filter(
      (item) =>
        !term ||
        [item.producto, item.variante, item.sku, item.observaciones, item.usuario].some((value) =>
          value.toLowerCase().includes(term),
        ),
    )
})

const { page, totalPages, paginatedItems, goToPage } = useClientPagination(filtered, 10)

async function loadData() {
  loading.value = true

  try {
    const [catalogItems, movementItems] = await Promise.all([
      loadInventoryCatalog(),
      getMovimientosInventario(),
    ])

    catalog.value = catalogItems
    movimientos.value = enrichMovements(movementItems, catalogItems)
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar los movimientos.'))
  } finally {
    loading.value = false
  }
}

async function saveMovement(data: MovimientoFormData) {
  saving.value = true

  try {
    const response = await registrarEntrada({
      variante_id: data.varianteId,
      cantidad: data.cantidad,
      observaciones: data.motivo,
    })

    modalOpen.value = false
    await showSuccess(response.message)
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible registrar el movimiento.'))
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb
      :items="[{ label: 'Inventario', to: '/inventario' }, { label: 'Entradas de inventario' }]"
    />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Entradas de inventario</h1>
        <p class="mt-1 text-sm text-gray-500">Consulta y registra entradas de mercancía.</p>
      </div>

      <BaseButton @click="modalOpen = true">
        <PlusIcon class="h-4 w-4" />
        Nueva entrada
      </BaseButton>
    </div>

    <div class="mb-6">
      <RouterLink
        to="/inventario"
        class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#C56B86]"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Volver al inventario
      </RouterLink>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o motivo..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando movimientos..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">SKU</th>
              <th class="px-5 py-4">Cantidad</th>
              <th class="px-5 py-4">Motivo</th>
              <th class="px-5 py-4">Usuario</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in paginatedItems" :key="item.id" class="interactive-lift-row">
              <td data-label="Fecha" class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ formatDate(item.fecha) }}
              </td>
              <td data-label="Producto" class="px-5 py-4 font-medium text-gray-900">
                {{ item.producto }}
              </td>
              <td data-label="Variante" class="px-5 py-4 text-gray-600">{{ item.variante }}</td>
              <td data-label="SKU" class="px-5 py-4 text-gray-600">{{ item.sku }}</td>
              <td data-label="Cantidad" class="px-5 py-4">
                <StatusChip status="success" :label="`+${item.cantidad}`" />
              </td>
              <td data-label="Motivo" class="px-5 py-4 text-gray-600">
                {{ item.observaciones || 'Sin observaciones' }}
              </td>
              <td data-label="Usuario" class="px-5 py-4 text-gray-600">{{ item.usuario }}</td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No se encontraron movimientos.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filtered.length > 10" class="mt-4">
      <BasePagination :page="page" :total-pages="totalPages" @change="goToPage" />
    </div>

    <MovimientoInventarioModal
      :open="modalOpen"
      tipo="entrada"
      :variantes="variantesOptions"
      :loading="saving"
      @close="modalOpen = false"
      @submit="saveMovement"
    />
  </section>
</template>
