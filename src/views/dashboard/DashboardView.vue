<script setup lang="ts">
import {
  ArchiveBoxIcon,
  BanknotesIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'

const stats = [
  {
    title: 'Ventas de hoy',
    value: '--',
    icon: ShoppingCartIcon,
  },
  {
    title: 'Ingresos de hoy',
    value: '--',
    icon: BanknotesIcon,
  },
  {
    title: 'Productos',
    value: '--',
    icon: CubeIcon,
  },
  {
    title: 'Stock bajo',
    value: '--',
    icon: ArchiveBoxIcon,
  },
]
</script>

<template>
  <section>
    <AppBreadcrumb />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <p class="mt-1 text-sm text-gray-500">Resumen general del sistema</p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="rounded-2xl border border-[#ECECEC] bg-white p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">
              {{ stat.title }}
            </p>

            <p class="mt-2 text-2xl font-semibold text-gray-900">
              {{ stat.value }}
            </p>
          </div>

          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF3]">
            <component :is="stat.icon" class="h-5 w-5 text-[#C56B86]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
