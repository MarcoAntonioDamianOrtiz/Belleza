<script setup lang="ts">
import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import { formatCurrency } from '@/utils/formatCurrency'

const stats = [
  {
    title: 'Ventas de hoy',
    value: '18',
    detail: '6 más que ayer',
    icon: ShoppingCartIcon,
  },
  {
    title: 'Ingresos de hoy',
    value: formatCurrency(3420.5),
    detail: 'Vista previa',
    icon: BanknotesIcon,
  },
  {
    title: 'Productos',
    value: '22',
    detail: '48 variantes',
    icon: CubeIcon,
  },
  {
    title: 'Stock bajo',
    value: '7',
    detail: '3 agotadas',
    icon: ArchiveBoxIcon,
  },
]

const weeklySales = [
  { label: 'Lun', value: 42 },
  { label: 'Mar', value: 64 },
  { label: 'Mié', value: 55 },
  { label: 'Jue', value: 78 },
  { label: 'Vie', value: 100 },
  { label: 'Sáb', value: 82 },
  { label: 'Dom', value: 36 },
]

const recentSales = [
  {
    folio: 'V-0104',
    date: '30/07/2026 10:12',
    payment: 'Efectivo',
    total: 395.4,
  },
  {
    folio: 'V-0103',
    date: '30/07/2026 09:45',
    payment: 'Tarjeta',
    total: 212.5,
  },
  {
    folio: 'V-0102',
    date: '30/07/2026 09:10',
    payment: 'Transferencia',
    total: 580,
  },
]

const lowStock = [
  { product: 'Labial Mate', variant: 'Rosa Nude', stock: 4 },
  { product: 'Labial Mate', variant: 'Ciruela', stock: 0 },
  { product: 'Crema Facial', variant: 'Hidratante 250 ml', stock: 3 },
]
</script>

<template>
  <section>
    <AppBreadcrumb />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Resumen general del sistema.</p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="rounded-2xl border border-[#ECECEC] bg-white p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-gray-500">{{ stat.title }}</p>
            <p class="mt-2 text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            <p class="mt-2 text-xs text-gray-400">{{ stat.detail }}</p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF3]">
            <component :is="stat.icon" class="h-5 w-5 text-[#C56B86]" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-gray-900">Ventas de la semana</h2>
            <p class="mt-1 text-sm text-gray-500">Comportamiento diario.</p>
          </div>

          <RouterLink
            to="/reportes"
            class="inline-flex items-center gap-1 text-sm font-medium text-[#C56B86]"
          >
            Ver reportes
            <ArrowRightIcon class="h-4 w-4" />
          </RouterLink>
        </div>

        <div class="mt-8 flex h-64 items-end gap-3">
          <div
            v-for="item in weeklySales"
            :key="item.label"
            class="flex flex-1 flex-col items-center gap-3"
          >
            <div class="flex h-52 w-full items-end rounded-t-lg bg-gray-50">
              <div class="w-full rounded-t-lg bg-[#C56B86]" :style="{ height: `${item.value}%` }" />
            </div>
            <span class="text-xs text-gray-500">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-[#ECECEC] bg-white">
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 class="font-semibold text-gray-900">Stock bajo</h2>
            <p class="mt-1 text-xs text-gray-500">Variantes que requieren atención.</p>
          </div>

          <RouterLink to="/inventario" class="text-sm font-medium text-[#C56B86]">
            Ver inventario
          </RouterLink>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="item in lowStock"
            :key="`${item.product}-${item.variant}`"
            class="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ item.product }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ item.variant }}</p>
            </div>

            <StatusChip
              :status="item.stock <= 0 ? 'danger' : 'warning'"
              :label="item.stock <= 0 ? 'Agotado' : `${item.stock} pza.`"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 class="font-semibold text-gray-900">Ventas recientes</h2>
          <p class="mt-1 text-xs text-gray-500">Últimas operaciones registradas.</p>
        </div>

        <RouterLink to="/ventas" class="text-sm font-medium text-[#C56B86]"> Ir al POS </RouterLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[650px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Folio</th>
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Método de pago</th>
              <th class="px-5 py-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="sale in recentSales" :key="sale.folio">
              <td class="px-5 py-4 font-medium text-gray-900">{{ sale.folio }}</td>
              <td class="px-5 py-4 text-gray-600">{{ sale.date }}</td>
              <td class="px-5 py-4 text-gray-600">{{ sale.payment }}</td>
              <td class="px-5 py-4 text-right font-semibold text-gray-900">
                {{ formatCurrency(sale.total) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
