<script setup lang="ts">
import StatusChip from '@/components/common/StatusChip.vue'
import { formatDate } from '@/utils/formatDate'

import type { Garantia } from '@/types/garantia'

interface Props {
  garantia: Garantia
}

defineProps<Props>()

function statusFor(estado: Garantia['estado']) {
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
  <dl class="grid gap-4 sm:grid-cols-2">
    <div>
      <dt class="text-xs uppercase text-gray-400">Venta</dt>
      <dd class="mt-1 font-medium text-gray-900">
        {{ garantia.ventaFolio }}
      </dd>
    </div>

    <div>
      <dt class="text-xs uppercase text-gray-400">Fecha</dt>
      <dd class="mt-1 text-gray-700">{{ formatDate(garantia.fecha) }}</dd>
    </div>

    <div>
      <dt class="text-xs uppercase text-gray-400">Producto</dt>
      <dd class="mt-1 text-gray-700">{{ garantia.producto }} - {{ garantia.variante }}</dd>
    </div>

    <div>
      <dt class="text-xs uppercase text-gray-400">Estado</dt>
      <dd class="mt-1">
        <StatusChip
          :status="statusFor(garantia.estado).status"
          :label="statusFor(garantia.estado).label"
        />
      </dd>
    </div>

    <div class="sm:col-span-2">
      <dt class="text-xs uppercase text-gray-400">Motivo</dt>
      <dd class="mt-1 text-gray-700">{{ garantia.motivo }}</dd>
    </div>

    <div v-if="garantia.resolucion">
      <dt class="text-xs uppercase text-gray-400">Resolución</dt>
      <dd class="mt-1 text-gray-700">{{ garantia.resolucion }}</dd>
    </div>

    <div v-if="garantia.observaciones">
      <dt class="text-xs uppercase text-gray-400">Observaciones</dt>
      <dd class="mt-1 text-gray-700">{{ garantia.observaciones }}</dd>
    </div>
  </dl>
</template>
