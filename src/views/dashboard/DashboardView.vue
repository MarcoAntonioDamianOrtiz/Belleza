<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArchiveBoxIcon,
  BanknotesIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import { getProductos } from '@/api/productos'
import { getVariantes } from '@/api/variantes'
import { getVentas } from '@/api/ventas'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { showError } from '@/utils/notifications'

import type { Variante } from '@/types/variante'
import type { VentaResumen } from '@/types/venta'

interface LowStockItem {
  id: string
  product: string
  variant: string
  stock: number
  stockMinimo: number
}

const ventas = ref<VentaResumen[]>([])
const variantes = ref<Variante[]>([])
const productNames = ref(new Map<string, string>())
const loading = ref(false)

const todayKey = new Date().toDateString()

const salesToday = computed(() =>
  ventas.value.filter(
    (item) => item.estado === 'COMPLETADA' && new Date(item.fecha).toDateString() === todayKey,
  ),
)

const incomeToday = computed(() => salesToday.value.reduce((total, item) => total + item.total, 0))

const lowStock = computed<LowStockItem[]>(() =>
  variantes.value
    .filter((item) => item.stock <= item.stockMinimo)
    .map((item) => ({
      id: item.id,
      product: productNames.value.get(item.productoId) ?? 'Producto',
      variant: item.nombre,
      stock: item.stock,
      stockMinimo: item.stockMinimo,
    }))
    .slice(0, 6),
)

const stats = computed(() => [
  {
    title: 'Ventas de hoy',
    value: String(salesToday.value.length),
    detail: 'Ventas completadas',
    icon: ShoppingCartIcon,
  },
  {
    title: 'Ingresos de hoy',
    value: formatCurrency(incomeToday.value),
    detail: 'Total registrado',
    icon: BanknotesIcon,
  },
  {
    title: 'Variantes',
    value: String(variantes.value.length),
    detail: 'Disponibles en catálogo',
    icon: CubeIcon,
  },
  {
    title: 'Stock bajo',
    value: String(lowStock.value.length),
    detail: 'Requieren atención',
    icon: ArchiveBoxIcon,
  },
])

const recentSales = computed(() => ventas.value.slice(0, 6))

async function loadData() {
  loading.value = true

  try {
    const [sales, products, variants] = await Promise.all([
      getVentas(),
      getProductos(),
      getVariantes(),
    ])

    ventas.value = sales
    variantes.value = variants
    productNames.value = new Map(products.map((item) => [item.id, item.nombre]))
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar el resumen del sistema.'))
  } finally {
    loading.value = false
  }
}

function statusFor(estado: VentaResumen['estado']) {
  if (estado === 'COMPLETADA') {
    return { status: 'success' as const, label: 'Completada' }
  }

  if (estado === 'CANCELADA') {
    return { status: 'danger' as const, label: 'Cancelada' }
  }

  return { status: 'warning' as const, label: 'Devuelta' }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Resumen general del sistema.</p>
    </div>

    <BaseLoader v-if="loading" text="Cargando resumen..." />

    <template v-else>
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.title"
          class="rounded-2xl border border-[#ECECEC] bg-white p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm text-gray-500">{{ stat.title }}</p>
              <p class="mt-2 text-2xl font-semibold text-gray-900">
                {{ stat.value }}
              </p>
              <p class="mt-2 text-xs text-gray-400">{{ stat.detail }}</p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF3]">
              <component :is="stat.icon" class="h-5 w-5 text-[#C56B86]" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 class="font-semibold text-gray-900">Ventas recientes</h2>
              <p class="mt-1 text-xs text-gray-500">Últimas operaciones registradas.</p>
            </div>

            <RouterLink to="/ventas" class="text-sm font-medium text-[#C56B86]">
              Ir al POS
            </RouterLink>
          </div>

          <div class="overflow-x-auto">
            <table class="mobile-stack-table w-full min-w-[650px] text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50">
                <tr class="text-xs font-semibold uppercase text-gray-500">
                  <th class="px-5 py-4">Folio</th>
                  <th class="px-5 py-4">Fecha</th>
                  <th class="px-5 py-4">Usuario</th>
                  <th class="px-5 py-4">Estado</th>
                  <th class="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100">
                <tr v-for="sale in recentSales" :key="sale.id" class="interactive-lift-row">
                  <td data-label="Folio" class="px-5 py-4 font-medium text-gray-900">
                    {{ sale.folio }}
                  </td>
                  <td data-label="Fecha" class="px-5 py-4 text-gray-600">
                    {{ formatDate(sale.fecha) }}
                  </td>
                  <td data-label="Usuario" class="px-5 py-4 text-gray-600">{{ sale.usuario }}</td>
                  <td data-label="Estado" class="px-5 py-4">
                    <StatusChip
                      :status="statusFor(sale.estado).status"
                      :label="statusFor(sale.estado).label"
                    />
                  </td>
                  <td data-label="Total" class="px-5 py-4 text-right font-semibold text-gray-900">
                    {{ formatCurrency(sale.total) }}
                  </td>
                </tr>

                <tr v-if="!recentSales.length">
                  <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                    No hay ventas registradas.
                  </td>
                </tr>
              </tbody>
            </table>
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
              :key="item.id"
              class="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ item.product }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ item.variant }} · mínimo {{ item.stockMinimo }}
                </p>
              </div>

              <StatusChip
                :status="item.stock <= 0 ? 'danger' : 'warning'"
                :label="item.stock <= 0 ? 'Agotado' : `${item.stock} pza.`"
              />
            </div>

            <p v-if="!lowStock.length" class="px-5 py-8 text-center text-sm text-gray-500">
              No hay productos con stock bajo.
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
