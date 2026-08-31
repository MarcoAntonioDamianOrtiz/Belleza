<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import { getReporte } from '@/api/reportes'
import { getFriendlyError } from '@/utils/apiError'
import { useClientPagination } from '@/composables/useClientPagination'
import { showError } from '@/utils/notifications'

import type { ReporteClave, ReporteFila } from '@/types/reporte'

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value: string, endOfDay = false) {
  if (!value) return null

  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!year || !month || !day) return null

  const date = new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  )

  return Number.isNaN(date.getTime()) ? null : date
}

function toUtcDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function getBackendDateRange(from: string, to: string) {
  const localStart = parseInputDate(from)
  const localEnd = parseInputDate(to, true)

  return {
    from: localStart ? toUtcDate(localStart) : '',
    to: localEnd ? toUtcDate(localEnd) : '',
  }
}

const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

const reportType = ref<ReporteClave>('ventas')
const startDate = ref(toInputDate(thirtyDaysAgo))
const endDate = ref(toInputDate(today))
const rows = ref<ReporteFila[]>([])
const loading = ref(false)
const generated = ref(false)

const { page, totalPages, paginatedItems, goToPage } = useClientPagination(rows, 10)

const reportOptions = [
  { label: 'Ventas', value: 'ventas' },
  { label: 'Inventario', value: 'inventario' },
  { label: 'Stock bajo', value: 'stock-bajo' },
  { label: 'Cortes de caja', value: 'cortes' },
  { label: 'Productos más vendidos', value: 'productos' },
  { label: 'Devoluciones', value: 'devoluciones' },
  { label: 'Garantías', value: 'garantias' },
  { label: 'Movimientos de inventario', value: 'movimientos' },
]

const selectedReportLabel = computed(
  () => reportOptions.find((option) => option.value === reportType.value)?.label ?? 'Reporte',
)

const reportUsesDates = computed(
  () => reportType.value !== 'inventario' && reportType.value !== 'stock-bajo',
)

const reportHasRowDate = computed(() =>
  ['ventas', 'cortes', 'devoluciones', 'garantias', 'movimientos'].includes(reportType.value),
)

function getRowDate(row: ReporteFila) {
  const value = reportType.value === 'cortes' ? row.fecha_inicio : row.fecha
  return typeof value === 'string' ? value : null
}

function isRowInsideSelectedLocalRange(row: ReporteFila) {
  if (!reportHasRowDate.value) return true

  const rawDate = getRowDate(row)
  if (!rawDate) return false

  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) return false

  const localStart = parseInputDate(startDate.value)
  const localEnd = parseInputDate(endDate.value, true)

  if (localStart && date < localStart) return false
  if (localEnd && date > localEnd) return false

  return true
}

watch(reportType, () => {
  rows.value = []
  generated.value = false
  goToPage(1)
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

async function generateReport() {
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
  rows.value = []
  goToPage(1)

  try {
    const params: Record<string, string> = {}

    if (reportUsesDates.value) {
      if (reportHasRowDate.value) {
        // Django filtra DateTimeField por fecha UTC. Ampliamos el rango a los
        // días UTC que toca el periodo local y después filtramos en el navegador.
        const backendRange = getBackendDateRange(startDate.value, endDate.value)

        if (backendRange.from) params.fecha_inicio = backendRange.from
        if (backendRange.to) params.fecha_fin = backendRange.to
      } else {
        if (startDate.value) params.fecha_inicio = startDate.value
        if (endDate.value) params.fecha_fin = endDate.value
      }
    }

    const reportRows = await getReporte(reportType.value, params)
    rows.value = reportRows.filter(isRowInsideSelectedLocalRange)
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

function exportCsv() {
  if (!rows.value.length) return

  const headers = columns.value
  const content = [
    headers.join(','),
    ...rows.value.map((row) =>
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
          <BaseButton class="w-full" :loading="loading" @click="generateReport">
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
        <BaseButton variant="secondary" @click="exportCsv">
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
            <tr v-for="(row, index) in paginatedItems" :key="index" class="interactive-lift-row">
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

    <div v-if="rows.length > 10" class="mt-4">
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
