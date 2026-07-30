<script setup lang="ts">
import { EyeIcon, PrinterIcon } from '@heroicons/vue/24/outline'

import EmptyState from '@/components/common/EmptyState.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import { formatCurrency } from '@/utils/formatCurrency'

import type { VentaRealizada } from '@/types/venta'

interface Props {
  ventas: VentaRealizada[]
}

defineProps<Props>()

const emit = defineEmits<{
  view: [venta: VentaRealizada]
  reprint: [venta: VentaRealizada]
}>()

function paymentLabel(value: VentaRealizada['metodoPago']) {
  const labels = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
  }

  return labels[value]
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
    <div class="overflow-x-auto">
      <table v-if="ventas.length" class="w-full min-w-[850px] text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr class="text-xs font-semibold uppercase text-gray-500">
            <th class="px-5 py-4">Folio</th>
            <th class="px-5 py-4">Fecha</th>
            <th class="px-5 py-4">Artículos</th>
            <th class="px-5 py-4">Pago</th>
            <th class="px-5 py-4">Total</th>
            <th class="px-5 py-4">Estado</th>
            <th class="px-5 py-4 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr v-for="venta in ventas" :key="venta.id" class="hover:bg-gray-50">
            <td class="px-5 py-4 font-medium text-gray-900">{{ venta.folio }}</td>
            <td class="whitespace-nowrap px-5 py-4 text-gray-600">{{ venta.fecha }}</td>
            <td class="px-5 py-4 text-gray-600">
              {{ venta.items.reduce((total, item) => total + item.cantidad, 0) }}
            </td>
            <td class="px-5 py-4 text-gray-600">{{ paymentLabel(venta.metodoPago) }}</td>
            <td class="px-5 py-4 font-semibold text-gray-900">{{ formatCurrency(venta.total) }}</td>
            <td class="px-5 py-4">
              <StatusChip status="success" label="Completada" />
            </td>
            <td class="px-5 py-4">
              <div class="flex justify-end gap-1">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                  aria-label="Ver venta"
                  @click="emit('view', venta)"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>

                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Reimprimir ticket"
                  @click="emit('reprint', venta)"
                >
                  <PrinterIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <EmptyState
        v-else
        title="No hay ventas"
        description="Las ventas realizadas aparecerán en esta sección."
      />
    </div>
  </div>
</template>
