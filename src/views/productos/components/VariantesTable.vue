<script setup lang="ts">
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

import StatusChip from '@/components/common/StatusChip.vue'
import { formatCurrency } from '@/utils/formatCurrency'

import type { Variante } from '@/types/variante'

interface Props {
  variantes: Variante[]
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [variante: Variante]
  delete: [variante: Variante]
}>()

function stockStatus(variante: Variante) {
  if (variante.stock <= 0) {
    return {
      status: 'danger' as const,
      label: 'Agotado',
    }
  }

  if (variante.stock <= variante.stockMinimo) {
    return {
      status: 'warning' as const,
      label: 'Stock bajo',
    }
  }

  return {
    status: 'success' as const,
    label: 'Disponible',
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="mobile-stack-table w-full min-w-[1120px] text-left text-sm">
      <thead class="border-y border-gray-200 bg-gray-50">
        <tr class="text-xs font-semibold uppercase text-gray-500">
          <th class="px-4 py-3">Variante</th>
          <th class="px-4 py-3">SKU</th>
          <th class="px-4 py-3">Código</th>
          <th class="px-4 py-3">Costo</th>
          <th class="px-4 py-3">Menudeo</th>
          <th class="px-4 py-3">Mayoreo</th>
          <th class="px-4 py-3">Stock</th>
          <th class="px-4 py-3">Mínimo</th>
          <th class="px-4 py-3">Garantía</th>
          <th class="px-4 py-3 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-100">
        <tr v-for="variante in variantes" :key="variante.id" class="hover:bg-gray-50">
          <td data-label="Variante" class="px-4 py-4 font-medium text-gray-900">
            {{ variante.nombre }}
          </td>
          <td data-label="SKU" class="px-4 py-4 text-gray-600">{{ variante.sku }}</td>
          <td data-label="Código" class="px-4 py-4 font-mono text-xs text-gray-600">
            {{ variante.codigoBarras }}
          </td>
          <td data-label="Costo" class="px-4 py-4 text-gray-600">
            {{ formatCurrency(variante.costo) }}
          </td>
          <td data-label="Menudeo" class="px-4 py-4 font-medium text-gray-900">
            {{ formatCurrency(variante.precioMenudeo) }}
          </td>
          <td data-label="Mayoreo" class="px-4 py-4 text-gray-600">
            {{ formatCurrency(variante.precioMayoreo) }}
          </td>
          <td data-label="Stock" class="px-4 py-4">
            <div class="flex flex-col items-start gap-1">
              <span class="font-medium text-gray-900">
                {{ variante.stock }}
              </span>
              <StatusChip
                :status="stockStatus(variante).status"
                :label="stockStatus(variante).label"
              />
            </div>
          </td>
          <td data-label="Mínimo" class="px-4 py-4 text-gray-600">
            {{ variante.stockMinimo }}
          </td>
          <td data-label="Garantía" class="px-4 py-4 text-gray-600">
            <span v-if="variante.garantiaMeses"> {{ variante.garantiaMeses }} meses </span>
            <span v-else class="text-gray-400">Sin garantía</span>
          </td>
          <td data-label="Acciones" class="px-4 py-4">
            <div class="flex justify-end gap-1">
              <button
                type="button"
                class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                aria-label="Editar variante"
                @click="emit('edit', variante)"
              >
                <PencilSquareIcon class="h-5 w-5" />
              </button>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Desactivar variante"
                @click="emit('delete', variante)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
