<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import { getMovimientosInventario } from '@/api/inventario'
import { enrichMovements, loadInventoryCatalog } from './inventarioData'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { showError } from '@/utils/notifications'

import type { TipoMovimientoInventario } from '@/types/inventario'
import type { MovimientoVista } from './inventarioData'

const search = ref('')
const typeFilter = ref<'TODOS' | TipoMovimientoInventario>('TODOS')
const loading = ref(false)
const movimientos = ref<MovimientoVista[]>([])

const typeOptions = [
  { label: 'Todos los movimientos', value: 'TODOS' },
  { label: 'Entradas', value: 'ENTRADA' },
  { label: 'Salidas', value: 'SALIDA' },
  { label: 'Ajustes', value: 'AJUSTE' },
]

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return movimientos.value.filter((item) => {
    const matchesType = typeFilter.value === 'TODOS' || item.tipo === typeFilter.value

    const matchesSearch =
      !term ||
      [item.producto, item.variante, item.sku, item.observaciones, item.usuario].some((value) =>
        value.toLowerCase().includes(term),
      )

    return matchesType && matchesSearch
  })
})

function statusFor(type: TipoMovimientoInventario) {
  if (type === 'ENTRADA') {
    return { status: 'success' as const, label: 'Entrada' }
  }

  if (type === 'SALIDA') {
    return { status: 'danger' as const, label: 'Salida' }
  }

  return { status: 'info' as const, label: 'Ajuste' }
}

function quantityLabel(item: MovimientoVista) {
  if (item.tipo === 'ENTRADA') return `+${item.cantidad}`
  if (item.tipo === 'SALIDA') return `-${item.cantidad}`
  return String(item.cantidad)
}

async function loadData() {
  loading.value = true

  try {
    const [catalog, items] = await Promise.all([loadInventoryCatalog(), getMovimientosInventario()])

    movimientos.value = enrichMovements(items, catalog)
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar el historial.'))
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Inventario', to: '/inventario' }, { label: 'Historial' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Historial de inventario</h1>
      <p class="mt-1 text-sm text-gray-500">Consulta todos los movimientos registrados.</p>
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

    <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o motivo..." />
      </div>

      <div class="w-full md:w-64">
        <BaseSelect
          v-model="typeFilter"
          :options="typeOptions"
          placeholder="Todos los movimientos"
        />
      </div>
    </div>

    <BaseLoader v-if="loading" text="Cargando historial..." />

    <div v-else>
      <div class="grid gap-3 lg:hidden">
        <article
          v-for="item in filtered"
          :key="item.id"
          class="rounded-2xl border border-[#ECECEC] bg-white p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-gray-900">
                {{ item.producto }}
              </p>
              <p class="mt-1 text-sm text-gray-500">{{ item.variante }} · {{ item.sku }}</p>
            </div>

            <StatusChip :status="statusFor(item.tipo).status" :label="statusFor(item.tipo).label" />
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs uppercase text-gray-400">Fecha</p>
              <p class="mt-1 text-gray-700">
                {{ formatDate(item.fecha) }}
              </p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-400">Cantidad</p>
              <p class="mt-1 font-semibold text-gray-900">
                {{ quantityLabel(item) }}
              </p>
            </div>

            <div class="col-span-2">
              <p class="text-xs uppercase text-gray-400">Motivo</p>
              <p class="mt-1 break-words text-gray-700">
                {{ item.observaciones || 'Sin observaciones' }}
              </p>
            </div>

            <div class="col-span-2">
              <p class="text-xs uppercase text-gray-400">Usuario</p>
              <p class="mt-1 text-gray-700">
                {{ item.usuario }}
              </p>
            </div>
          </div>
        </article>

        <div
          v-if="!filtered.length"
          class="rounded-2xl border border-[#ECECEC] bg-white px-6 py-12 text-center text-gray-500"
        >
          No se encontraron movimientos.
        </div>
      </div>

      <div class="hidden overflow-hidden rounded-2xl border border-[#ECECEC] bg-white lg:block">
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
                <th class="px-5 py-4">Usuario</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in filtered" :key="item.id" class="hover:bg-gray-50">
                <td class="whitespace-nowrap px-5 py-4 text-gray-600">
                  {{ formatDate(item.fecha) }}
                </td>
                <td class="px-5 py-4 font-medium text-gray-900">
                  {{ item.producto }}
                </td>
                <td class="px-5 py-4 text-gray-600">{{ item.variante }}</td>
                <td class="px-5 py-4 text-gray-600">{{ item.sku }}</td>
                <td class="px-5 py-4">
                  <StatusChip
                    :status="statusFor(item.tipo).status"
                    :label="statusFor(item.tipo).label"
                  />
                </td>
                <td class="px-5 py-4 font-semibold text-gray-900">
                  {{ quantityLabel(item) }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.observaciones || 'Sin observaciones' }}
                </td>
                <td class="px-5 py-4 text-gray-600">{{ item.usuario }}</td>
              </tr>

              <tr v-if="!filtered.length">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                  No se encontraron movimientos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
