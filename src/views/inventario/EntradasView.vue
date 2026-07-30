<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import MovimientoInventarioModal from './components/MovimientoInventarioModal.vue'

import type { MovimientoFormData } from './components/MovimientoInventarioForm.vue'

interface Entrada {
  id: number
  fecha: string
  producto: string
  variante: string
  sku: string
  cantidad: number
  motivo: string
}

const search = ref('')
const modalOpen = ref(false)

const entradas = ref<Entrada[]>([
  {
    id: 1,
    fecha: '26/07/2026 10:30',
    producto: 'Labial Mate',
    variante: 'Rojo Cereza',
    sku: 'LAB-MAT-ROJ',
    cantidad: 20,
    motivo: 'Compra a proveedor',
  },
  {
    id: 2,
    fecha: '25/07/2026 16:15',
    producto: 'Labial Mate',
    variante: 'Rosa Nude',
    sku: 'LAB-MAT-NUD',
    cantidad: 10,
    motivo: 'Compra a proveedor',
  },
])

const filteredEntries = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return entradas.value

  return entradas.value.filter((entrada) =>
    [entrada.producto, entrada.variante, entrada.sku, entrada.motivo].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

function newEntry() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function saveEntry(data: MovimientoFormData) {
  const variantes = {
    1: {
      producto: 'Labial Mate',
      variante: 'Rojo Cereza',
      sku: 'LAB-MAT-ROJ',
    },
    2: {
      producto: 'Labial Mate',
      variante: 'Rosa Nude',
      sku: 'LAB-MAT-NUD',
    },
    3: {
      producto: 'Labial Mate',
      variante: 'Ciruela',
      sku: 'LAB-MAT-CIR',
    },
  }

  const variante = variantes[data.varianteId as keyof typeof variantes]

  if (!variante || !data.cantidad) return

  entradas.value.unshift({
    id: Date.now(),
    fecha: new Date().toLocaleString('es-MX'),
    ...variante,
    cantidad: data.cantidad,
    motivo: data.motivo,
  })

  closeModal()
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Inventario', to: '/inventario' }, { label: 'Entradas' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Entradas de inventario</h1>

        <p class="mt-1 text-sm text-gray-500">Consulta y registra las entradas de mercancía.</p>
      </div>

      <BaseButton @click="newEntry">
        <PlusIcon class="h-4 w-4" />
        Nueva entrada
      </BaseButton>
    </div>

    <div class="mb-6">
      <RouterLink
        to="/inventario"
        class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#C56B86]"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Volver al inventario
      </RouterLink>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar producto, variante, SKU o motivo..." />
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Variante</th>
              <th class="px-5 py-4">SKU</th>
              <th class="px-5 py-4">Cantidad</th>
              <th class="px-5 py-4">Motivo</th>
              <th class="px-5 py-4">Tipo</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="entrada in filteredEntries"
              :key="entrada.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ entrada.fecha }}
              </td>

              <td class="px-5 py-4 font-medium text-gray-900">
                {{ entrada.producto }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ entrada.variante }}
              </td>

              <td class="px-5 py-4 text-gray-600">
                {{ entrada.sku }}
              </td>

              <td class="px-5 py-4 font-semibold text-gray-900">+{{ entrada.cantidad }}</td>

              <td class="px-5 py-4 text-gray-600">
                {{ entrada.motivo }}
              </td>

              <td class="px-5 py-4">
                <StatusChip status="success" label="Entrada" />
              </td>
            </tr>

            <tr v-if="!filteredEntries.length">
              <td colspan="7" class="px-6 py-12 text-center">
                <p class="font-medium text-gray-900">No se encontraron entradas</p>

                <p class="mt-1 text-sm text-gray-500">Intenta realizar otra búsqueda.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <MovimientoInventarioModal
      :open="modalOpen"
      tipo="entrada"
      @close="closeModal"
      @submit="saveEntry"
    />
  </section>
</template>
