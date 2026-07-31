<script setup lang="ts">
import StatusChip from '@/components/common/StatusChip.vue'
import { formatDate } from '@/utils/formatDate'

import type { Devolucion } from '@/types/devolucion'

interface Props {
  devolucion: Devolucion
}

defineProps<Props>()

function statusFor(estado: Devolucion['estado']) {
  if (estado === 'APROBADA') {
    return { status: 'success' as const, label: 'Aprobada' }
  }

  if (estado === 'RECHAZADA') {
    return { status: 'danger' as const, label: 'Rechazada' }
  }

  if (estado === 'FINALIZADA') {
    return { status: 'info' as const, label: 'Finalizada' }
  }

  return { status: 'warning' as const, label: 'Pendiente' }
}
</script>

<template>
  <div class="space-y-5">
    <dl class="grid gap-4 sm:grid-cols-2">
      <div>
        <dt class="text-xs uppercase text-gray-400">Venta</dt>
        <dd class="mt-1 font-medium text-gray-900">
          {{ devolucion.ventaFolio }}
        </dd>
      </div>

      <div>
        <dt class="text-xs uppercase text-gray-400">Fecha</dt>
        <dd class="mt-1 text-gray-700">
          {{ formatDate(devolucion.fecha) }}
        </dd>
      </div>

      <div>
        <dt class="text-xs uppercase text-gray-400">Tipo</dt>
        <dd class="mt-1 text-gray-700">{{ devolucion.tipo }}</dd>
      </div>

      <div>
        <dt class="text-xs uppercase text-gray-400">Estado</dt>
        <dd class="mt-1">
          <StatusChip
            :status="statusFor(devolucion.estado).status"
            :label="statusFor(devolucion.estado).label"
          />
        </dd>
      </div>

      <div class="sm:col-span-2">
        <dt class="text-xs uppercase text-gray-400">Motivo</dt>
        <dd class="mt-1 text-gray-700">{{ devolucion.motivo }}</dd>
      </div>
    </dl>

    <div>
      <h3 class="font-medium text-gray-900">Productos</h3>
      <div class="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100">
        <div
          v-for="(item, index) in devolucion.productos"
          :key="`${item.varianteId}-${index}`"
          class="flex items-center justify-between gap-4 p-4 text-sm"
        >
          <span class="text-gray-700"> {{ item.producto }} - {{ item.variante }} </span>
          <span class="font-medium text-gray-900">
            {{ item.cantidad }}
          </span>
        </div>

        <p v-if="!devolucion.productos.length" class="p-4 text-sm text-gray-500">
          No hay productos registrados.
        </p>
      </div>
    </div>
  </div>
</template>
