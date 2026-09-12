<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import { getReporte, getReportePage } from '@/api/reportes'
import { getFriendlyError } from '@/utils/apiError'
import { showError } from '@/utils/notifications'
import { useAuthStore } from '@/stores/auth'

import type { ReporteClave, ReporteFila } from '@/types/reporte'

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const authStore = useAuthStore()

const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

const reportType = ref<ReporteClave>(authStore.isAdmin ? 'ventas' : 'inventario')
const startDate = ref(toInputDate(thirtyDaysAgo))
const endDate = ref(toInputDate(today))
const rows = ref<ReporteFila[]>([])
const loading = ref(false)
const exporting = ref(false)
const generated = ref(false)
const page = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const pageSize = 10

const allReportOptions: Array<{ label: string; value: ReporteClave; adminOnly?: boolean }> = [
  { label: 'Ventas', value: 'ventas', adminOnly: true },
  { label: 'Inventario', value: 'inventario' },
  { label: 'Stock bajo', value: 'stock-bajo' },
  { label: 'Cortes de caja', value: 'cortes', adminOnly: true },
  { label: 'Productos más vendidos', value: 'productos', adminOnly: true },
  { label: 'Devoluciones', value: 'devoluciones', adminOnly: true },
  { label: 'Garantías', value: 'garantias', adminOnly: true },
  { label: 'Movimientos de inventario', value: 'movimientos', adminOnly: true },
]

const reportOptions = computed(() =>
  allReportOptions.filter((option) => !option.adminOnly || authStore.isAdmin),
)

const selectedReportLabel = computed(
  () => reportOptions.value.find((option) => option.value === reportType.value)?.label ?? 'Reporte',
)

const reportUsesDates = computed(
  () => reportType.value !== 'inventario' && reportType.value !== 'stock-bajo',
)

watch(reportType, () => {
  rows.value = []
  generated.value = false
  page.value = 1
  totalPages.value = 1
  totalCount.value = 0
})

const columns = computed(() => {
  const keys = new Set<string>()

  for (const row of rows.value) {
    Object.keys(row).forEach((key) => keys.add(key))
  }

  return [...keys]
})

function formatHeader(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

async function generateReport(targetPage = 1) {
  if (
    reportUsesDates.value &&
    startDate.value &&
    endDate.value &&
    startDate.value > endDate.value
  ) {
    await showError('La fecha inicial no puede ser posterior a la fecha final.')
    return
  }

  loading.value = true
  generated.value = false

  try {
    const params: Record<string, string> = {}

    if (reportUsesDates.value) {
      if (startDate.value) params.fecha_inicio = startDate.value
      if (endDate.value) params.fecha_fin = endDate.value
    }

    const result = await getReportePage(reportType.value, params, targetPage, pageSize)

    rows.value = result.items
    page.value = result.page
    totalPages.value = result.totalPages
    totalCount.value = result.count
    generated.value = true
  } catch (error) {
    await showError(
      getFriendlyError(
        error,
        `No fue posible generar el reporte de ${selectedReportLabel.value.toLowerCase()}.`,
      ),
    )
  } finally {
    loading.value = false
  }
}

function goToPage(targetPage: number) {
  void generateReport(targetPage)
}

async function exportCsv() {
  if (!totalCount.value) return

  exporting.value = true

  try {
    const params: Record<string, string> = {}

    if (reportUsesDates.value) {
      if (startDate.value) params.fecha_inicio = startDate.value
      if (endDate.value) params.fecha_fin = endDate.value
    }

    const exportRows = await getReporte(reportType.value, params)
    if (!exportRows.length) return

    const headers = [...new Set(exportRows.flatMap((row) => Object.keys(row)))]
    const content = [
      headers.join(','),
      ...exportRows.map((row) =>
        headers
          .map((header) => {
            const value = formatCell(row[header]).replaceAll('"', '""')
            return `"${value}"`
          })
          .join(','),
      ),
    ].join('\n')

    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `reporte-${reportType.value}.csv`
    link.click()

    URL.revokeObjectURL(url)
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible exportar el reporte.'))
  } finally {
    exporting.value = false
  }
}

</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Reportes' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Reportes</h1>
      <p class="mt-1 text-sm text-gray-500">Consulta información del negocio por módulo.</p>
    </div>

    <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BaseSelect
          v-model="reportType"
          label="Tipo de reporte"
          :options="reportOptions"
          required
        />

        <BaseInput
          v-model="startDate"
          type="date"
          label="Fecha inicial"
          :disabled="!reportUsesDates"
        />

        <BaseInput
          v-model="endDate"
          type="date"
          label="Fecha final"
          :disabled="!reportUsesDates"
        />

        <div class="flex items-end">
          <BaseButton class="w-full" :loading="loading" @click="generateReport(1)">
            Generar reporte
          </BaseButton>
        </div>
      </div>
    </div>

    <BaseLoader v-if="loading" text="Generando reporte..." />

    <div
      v-else-if="rows.length"
      class="mt-6 overflow-hidden rounded-2xl border border-[#ECECEC] bg-white"
    >
      <div class="flex justify-end border-b border-gray-100 p-4">
        <BaseButton variant="secondary" :loading="exporting" @click="exportCsv">
          <ArrowDownTrayIcon class="h-5 w-5" />
          Exportar
        </BaseButton>
      </div>

      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[850px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th v-for="column in columns" :key="column" class="px-5 py-4">
                {{ formatHeader(column) }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="(row, index) in rows" :key="index" class="interactive-lift-row">
              <td
                v-for="column in columns"
                :key="column"
                :data-label="formatHeader(column)"
                class="px-5 py-4 text-gray-600"
              >
                {{ formatCell(row[column]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="generated && totalPages > 1" class="mt-4">
      <BasePagination :page="page" :total-pages="totalPages" @change="goToPage" />
    </div>

    <div
      v-else
      class="mt-6 rounded-2xl border border-[#ECECEC] bg-white p-12 text-center text-gray-500"
    >
      <template v-if="generated">
        No hay resultados para {{ selectedReportLabel.toLowerCase() }}
        <span v-if="reportUsesDates">en el periodo seleccionado</span>.
      </template>
      <template v-else>
        Selecciona un reporte y presiona “Generar reporte”.
      </template>
    </div>
  </section>
</template>
