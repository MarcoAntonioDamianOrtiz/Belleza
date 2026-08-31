<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseDateRangeFilter from '@/components/ui/BaseDateRangeFilter.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import { getBitacora } from '@/api/bitacora'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { useClientPagination } from '@/composables/useClientPagination'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { showError } from '@/utils/notifications'

import type { BitacoraRegistro } from '@/types/bitacora'

const registros = ref<BitacoraRegistro[]>([])
const search = ref('')
const loading = ref(false)
const { dateFrom, dateTo, matchesDate } = useDateRangeFilter('30days')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return registros.value.filter((item) => {
    const matchesSearch =
      !term ||
      [item.modulo, item.accion, item.descripcion, item.usuario].some((value) =>
        value.toLowerCase().includes(term),
      )

    return matchesSearch && matchesDate(item.fecha)
  })
})

const { page, totalPages, paginatedItems, goToPage } = useClientPagination(filtered, 10)

async function loadData() {
  loading.value = true

  try {
    registros.value = await getBitacora()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar la bitácora.'))
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Bitácora' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Bitácora</h1>
      <p class="mt-1 text-sm text-gray-500">
        Consulta las acciones importantes realizadas en el sistema.
      </p>
    </div>

    <BaseDateRangeFilter
      v-model:from="dateFrom"
      v-model:to="dateTo"
      class="mb-4"
    />

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar módulo, acción, usuario o descripción..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando bitácora..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Usuario</th>
              <th class="px-5 py-4">Módulo</th>
              <th class="px-5 py-4">Acción</th>
              <th class="px-5 py-4">Descripción</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in paginatedItems" :key="item.id" class="interactive-lift-row">
              <td data-label="Fecha" class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ formatDate(item.fecha) }}
              </td>
              <td data-label="Usuario" class="px-5 py-4 font-medium text-gray-900">
                {{ item.usuario }}
              </td>
              <td data-label="Módulo" class="px-5 py-4">
                <StatusChip status="info" :label="item.modulo" />
              </td>
              <td data-label="Acción" class="px-5 py-4 text-gray-600">{{ item.accion }}</td>
              <td data-label="Descripción" class="px-5 py-4 text-gray-600">
                {{ item.descripcion }}
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No se encontraron registros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filtered.length > 10" class="mt-4">
      <BasePagination :page="page" :total-pages="totalPages" @change="goToPage" />
    </div>
  </section>
</template>
