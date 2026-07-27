<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import MovimientoInventarioModal from './components/MovimientoInventarioModal.vue'

import type { MovimientoFormData } from './components/MovimientoInventarioForm.vue'

interface Ajuste {
  id: number
  fecha: string
  producto: string
  variante: string
  sku: string
  stockAnterior: number
  stockNuevo: number
  motivo: string
}

const search = ref('')
const modalOpen = ref(false)

const ajustes = ref<Ajuste[]>([
  {
    id: 1,
    fecha: '26/07/2026 14:20',
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    stockAnterior: 26,
    stockNuevo: 24,
    motivo: 'Corrección por conteo físico',
  },
  {
    id: 2,
    fecha: '25/07/2026 11:40',
    producto: 'Labial Mate',
    variante: 'Rosa Nude',
    sku: 'LAB-MAT-NUD',
    stockAnterior: 3,
    stockNuevo: 4,
    motivo: 'Diferencia de inventario',
  },
])

const filteredAdjustments = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return ajustes.value

  return ajustes.value.filter((ajuste) =>
    [ajuste.producto, ajuste.variante, ajuste.sku, ajuste.motivo].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

function adjustmentDifference(ajuste: Ajuste) {
  return ajuste.stockNuevo - ajuste.stockAnterior
}

function newAdjustment() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function saveAdjustment(data: MovimientoFormData) {
  const variantes = {
    1: {
      producto: 'Labial Mate',
      variante: 'Rojo Cereza',
      sku: 'LAB-MAT-ROJ',
      stock: 24,
    },
    2: {
      producto: 'Labial Mate',
      variante: 'Rosa Nude',
      sku: 'LAB-MAT-NUD',
      stock: 4,
    },
    3: {
      producto: 'Labial Mate',
      variante: 'Ciruela',
      sku: 'LAB-MAT-CIR',
      stock: 0,
    },
  }

  const variante =
    variantes[data.varianteId as keyof typeof variantes]

  if (!variante || data.stockNuevo === undefined) return

  ajustes.value.unshift({
    id: Date.now(),
    fecha: new Date().toLocaleString('es-MX'),
    producto: variante.producto,
    variante: variante.variante,
    sku: variante.sku,
    stockAnterior: variante.stock,
    stockNuevo: data.stockNuevo,
    motivo: data.motivo,
  })

  closeModal()
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Inventario', to: '/inventario' }, { label: 'Ajustes' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Ajustes de inventario</h1>

        <p class="mt-1 text-sm text-gray-500">Consulta y registra correcciones de inventario.</p>
      </div>

      <BaseButton @click="newAdjustment">
        <PlusIcon class="h-4 w-4" />
        Nuevo ajuste
      </BaseButton>
    </div>

    <div class="mb-6">
      <RouterLink to="/inventario"
        class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#C56B86]">
        <ArrowLeftIcon class="h-4 w-4" />
        Volver al inventario
      </RouterLink>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o motivo..." />
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">SKU</th>
              <th class="px-5 py-4">Anterior</th>
              <th class="px-5 py-4">Nuevo</th>
              <th class="px-5 py-4">Diferencia</th>
              <th class="px-5 py-4">Motivo</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="ajuste in filteredAdjustments" :key="ajuste.id" class="transition-colors hover:bg-gray-50">
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ ajuste.fecha }}
              </td>

              <td class="px-5 py-4 font-medium text-gray-900">
                {{ ajuste.producto }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ ajuste.variante }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ ajuste.sku }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ ajuste.stockAnterior }}
              </td>

              <td class="px-5 py-4 font-medium text-gray-900">
                {{ ajuste.stockNuevo }}
              </td>

              <td class="px-5 py-4">
                <StatusChip v-if="adjustmentDifference(ajuste) > 0" status="success"
                  :label="`+${adjustmentDifference(ajuste)}`" />

                <StatusChip v-else-if="adjustmentDifference(ajuste) < 0" status="danger"
                  :label="String(adjustmentDifference(ajuste))" />

                <StatusChip v-else status="neutral" label="0" />
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ ajuste.motivo }}
              </td>
            </tr>

            <tr v-if="!filteredAdjustments.length">
              <td colspan="8" class="px-6 py-12 text-center">
                <p class="font-medium text-gray-900">No se encontraron ajustes</p>

                <p class="mt-1 text-sm text-gray-500">Intenta realizar otra búsqueda.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <MovimientoInventarioModal :open="modalOpen" tipo="ajuste" @close="closeModal" @submit="saveAdjustment" />
  </section>
</template>
