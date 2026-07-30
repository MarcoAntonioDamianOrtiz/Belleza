<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { formatCurrency } from '@/utils/formatCurrency'

type ReportType = 'ventas' | 'inventario' | 'productos' | 'caja' | 'garantias' | 'devoluciones'

const reportType = ref<ReportType>('ventas')
const startDate = ref('2026-07-01')
const endDate = ref('2026-07-30')
const exportMessage = ref('')

const reportOptions = [
  { label: 'Ventas', value: 'ventas' },
  { label: 'Inventario', value: 'inventario' },
  { label: 'Productos', value: 'productos' },
  { label: 'Caja', value: 'caja' },
  { label: 'Garantías', value: 'garantias' },
  { label: 'Devoluciones', value: 'devoluciones' },
]

const stats = computed(() => {
  const data = {
    ventas: [
      { label: 'Ingresos', value: formatCurrency(18450), icon: BanknotesIcon },
      { label: 'Ventas', value: '124', icon: ShoppingCartIcon },
      { label: 'Unidades', value: '186', icon: CubeIcon },
      { label: 'Ticket promedio', value: formatCurrency(148.79), icon: ChartBarIcon },
    ],
    inventario: [
      { label: 'Variantes', value: '48', icon: CubeIcon },
      { label: 'Stock total', value: '1,284', icon: ChartBarIcon },
      { label: 'Stock bajo', value: '7', icon: ShoppingCartIcon },
      { label: 'Agotadas', value: '3', icon: BanknotesIcon },
    ],
    productos: [
      { label: 'Productos', value: '22', icon: CubeIcon },
      { label: 'Variantes', value: '48', icon: ChartBarIcon },
      { label: 'Más vendido', value: 'Labial Mate', icon: ShoppingCartIcon },
      { label: 'Unidades vendidas', value: '186', icon: BanknotesIcon },
    ],
    caja: [
      { label: 'Ingresos', value: formatCurrency(18450), icon: BanknotesIcon },
      { label: 'Efectivo', value: formatCurrency(7820), icon: ShoppingCartIcon },
      { label: 'Tarjeta', value: formatCurrency(9250), icon: ChartBarIcon },
      { label: 'Transferencia', value: formatCurrency(1380), icon: CubeIcon },
    ],
    garantias: [
      { label: 'Solicitudes', value: '14', icon: ChartBarIcon },
      { label: 'Pendientes', value: '4', icon: ShoppingCartIcon },
      { label: 'Aprobadas', value: '8', icon: CubeIcon },
      { label: 'Rechazadas', value: '2', icon: BanknotesIcon },
    ],
    devoluciones: [
      { label: 'Solicitudes', value: '11', icon: ChartBarIcon },
      { label: 'Pendientes', value: '3', icon: ShoppingCartIcon },
      { label: 'Aprobadas', value: '6', icon: CubeIcon },
      { label: 'Rechazadas', value: '2', icon: BanknotesIcon },
    ],
  }

  return data[reportType.value]
})

const chartData = [
  { label: 'Lun', value: 45 },
  { label: 'Mar', value: 70 },
  { label: 'Mié', value: 55 },
  { label: 'Jue', value: 86 },
  { label: 'Vie', value: 100 },
  { label: 'Sáb', value: 76 },
  { label: 'Dom', value: 38 },
]

const topProducts = [
  { product: 'Labial Mate', variant: 'Rojo Cereza', units: 42, total: 3570 },
  { product: 'Crema Facial', variant: 'Hidratante 250 ml', units: 31, total: 5580 },
  { product: 'Labial Mate', variant: 'Rosa Nude', units: 28, total: 2380 },
  { product: 'Plancha de Cabello', variant: 'Cerámica', units: 12, total: 9000 },
]

function exportReport(format: 'PDF' | 'Excel') {
  exportMessage.value = `Exportación ${format} preparada como demostración. Después se conectará al endpoint correspondiente.`

  window.setTimeout(() => {
    exportMessage.value = ''
  }, 3500)
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Reportes' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Reportes</h1>
      <p class="mt-1 text-sm text-gray-500">Consulta indicadores y resultados del negocio.</p>
    </div>

    <div class="mb-6 rounded-2xl border border-[#ECECEC] bg-white p-5">
      <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-[260px_1fr_1fr_auto]">
        <BaseSelect v-model="reportType" label="Tipo de reporte" :options="reportOptions" />

        <BaseInput v-model="startDate" type="date" label="Fecha inicial" />

        <BaseInput v-model="endDate" type="date" label="Fecha final" />

        <div class="flex items-end gap-2">
          <BaseButton variant="secondary" @click="exportReport('PDF')">
            <ArrowDownTrayIcon class="h-4 w-4" />
            PDF
          </BaseButton>

          <BaseButton variant="secondary" @click="exportReport('Excel')">
            <ArrowDownTrayIcon class="h-4 w-4" />
            Excel
          </BaseButton>
        </div>
      </div>

      <p v-if="exportMessage" class="mt-4 text-sm text-[#C56B86]">
        {{ exportMessage }}
      </p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl border border-[#ECECEC] bg-white p-5"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="mt-2 text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF3]">
            <component :is="stat.icon" class="h-5 w-5 text-[#C56B86]" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <div>
          <h2 class="font-semibold text-gray-900">Comportamiento semanal</h2>
          <p class="mt-1 text-sm text-gray-500">Vista previa con datos mock.</p>
        </div>

        <div class="mt-8 flex h-64 items-end gap-3">
          <div
            v-for="item in chartData"
            :key="item.label"
            class="flex flex-1 flex-col items-center gap-3"
          >
            <div class="flex h-52 w-full items-end rounded-t-lg bg-gray-50">
              <div
                class="w-full rounded-t-lg bg-[#C56B86] transition-all"
                :style="{ height: `${item.value}%` }"
              />
            </div>
            <span class="text-xs text-gray-500">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <h2 class="font-semibold text-gray-900">Distribución de pagos</h2>

        <div class="mt-6 space-y-5">
          <div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Efectivo</span>
              <span class="font-medium text-gray-900">42%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-full w-[42%] rounded-full bg-[#C56B86]" />
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Tarjeta</span>
              <span class="font-medium text-gray-900">50%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-full w-1/2 rounded-full bg-blue-500" />
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Transferencia</span>
              <span class="font-medium text-gray-900">8%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-full w-[8%] rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="border-b border-gray-100 px-5 py-4">
        <h2 class="font-semibold text-gray-900">Productos más vendidos</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">Unidades</th>
              <th class="px-5 py-4 text-right">Ingresos</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in topProducts" :key="`${item.product}-${item.variant}`">
              <td class="px-5 py-4 font-medium text-gray-900">{{ item.product }}</td>
              <td class="px-5 py-4 text-gray-600">{{ item.variant }}</td>
              <td class="px-5 py-4 text-gray-600">{{ item.units }}</td>
              <td class="px-5 py-4 text-right font-semibold text-gray-900">
                {{ formatCurrency(item.total) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
