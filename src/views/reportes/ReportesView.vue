<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import { getReporte } from '@/api/reportes'
import { getFriendlyError } from '@/utils/apiError'
import { showError } from '@/utils/notifications'

import type { ReporteClave, ReporteFila } from '@/types/reporte'

const reportType = ref<ReporteClave>('ventas')
const startDate = ref('')
const endDate = ref('')
const rows = ref<ReporteFila[]>([])
const loading = ref(false)

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
  loading.value = true

  try {
    const params: Record<string, string> = {}

    if (startDate.value) params.fecha_inicio = startDate.value
    if (endDate.value) params.fecha_fin = endDate.value

    rows.value = await getReporte(reportType.value, params)
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible generar el reporte.'))
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

        <BaseInput v-model="startDate" type="date" label="Fecha inicial" />

        <BaseInput v-model="endDate" type="date" label="Fecha final" />

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
            <tr v-for="(row, index) in rows" :key="index" class="hover:bg-gray-50">
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

    <div
      v-else
      class="mt-6 rounded-2xl border border-[#ECECEC] bg-white p-12 text-center text-gray-500"
    >
      Selecciona un reporte y presiona “Generar reporte”.
    </div>
  </section>
</template>
