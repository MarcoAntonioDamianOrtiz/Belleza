<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseDateRangeFilter from '@/components/ui/BaseDateRangeFilter.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import { getBitacora, getBitacoraPage } from '@/api/bitacora'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { showError } from '@/utils/notifications'

import type { BitacoraRegistro } from '@/types/bitacora'

const registros = ref<BitacoraRegistro[]>([])
const searchResults = ref<BitacoraRegistro[]>([])
const search = ref('')
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const pageSize = 10
const { dateFrom, dateTo } = useDateRangeFilter('30days')

const searchTerm = computed(() => search.value.trim().toLowerCase())
const searchMode = computed(() => Boolean(searchTerm.value))

const filteredSearchResults = computed(() =>
  searchResults.value.filter((item) =>
    [item.modulo, item.accion, item.descripcion, item.usuario].some((value) =>
      value.toLowerCase().includes(searchTerm.value),
    ),
  ),
)

const searchTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredSearchResults.value.length / pageSize)),
)

const displayItems = computed(() => {
  if (!searchMode.value) return registros.value

  const start = (page.value - 1) * pageSize
  return filteredSearchResults.value.slice(start, start + pageSize)
})

const displayTotalPages = computed(() =>
  searchMode.value ? searchTotalPages.value : totalPages.value,
)

function dateParams() {
  const params: Record<string, string> = {}

  if (dateFrom.value) params.fecha_desde = dateFrom.value
  if (dateTo.value) params.fecha_hasta = dateTo.value

  return params
}

async function loadData(targetPage = 1) {
  loading.value = true

  try {
    const result = await getBitacoraPage(targetPage, pageSize, dateParams())

    registros.value = result.items
    page.value = result.page
    totalPages.value = result.totalPages
    totalCount.value = result.count
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar la bitácora.'))
  } finally {
    loading.value = false
  }
}

async function loadSearchData() {
  if (!searchMode.value) {
    searchResults.value = []
    page.value = 1
    await loadData(1)
    return
  }

  loading.value = true

  try {
    searchResults.value = await getBitacora(dateParams())
    page.value = 1
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible buscar en la bitácora.'))
  } finally {
    loading.value = false
  }
}

function goToPage(targetPage: number) {
  if (searchMode.value) {
    page.value = Math.min(Math.max(targetPage, 1), searchTotalPages.value)
    return
  }

  void loadData(targetPage)
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    void loadSearchData()
  }, 300)
})

watch([dateFrom, dateTo], () => {
  if (searchMode.value) {
    void loadSearchData()
  } else {
    void loadData(1)
  }
})

onMounted(() => {
  void loadData(1)
})
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
            <tr v-for="item in displayItems" :key="item.id" class="interactive-lift-row">
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

            <tr v-if="!displayItems.length">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                No se encontraron registros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="displayTotalPages > 1" class="mt-4">
      <BasePagination :page="page" :total-pages="displayTotalPages" @change="goToPage" />
    </div>
  </section>
</template>
