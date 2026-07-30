<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import type { Devolucion } from '@/types/devolucion'

interface Props {
  devolucion: Devolucion
}

defineProps<Props>()

const emit = defineEmits<{
  approve: [devolucion: Devolucion]
  reject: [devolucion: Devolucion]
}>()

function statusConfig(status: Devolucion['estado']) {
  if (status === 'aprobada') {
    return { status: 'success' as const, label: 'Aprobada' }
  }

  if (status === 'rechazada') {
    return { status: 'danger' as const, label: 'Rechazada' }
  }

  return { status: 'warning' as const, label: 'Pendiente' }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-sm text-gray-500">Devolución</p>
        <h3 class="mt-1 text-xl font-semibold text-gray-900">
          {{ devolucion.folio }}
        </h3>
      </div>

      <StatusChip
        :status="statusConfig(devolucion.estado).status"
        :label="statusConfig(devolucion.estado).label"
      />
    </div>

    <dl class="grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Venta</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ devolucion.ventaFolio }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Fecha</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ devolucion.fechaSolicitud }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Cliente</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ devolucion.cliente }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Tipo</dt>
        <dd class="mt-1 text-sm font-medium capitalize text-gray-900">{{ devolucion.tipo }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Producto</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">
          {{ devolucion.producto }} - {{ devolucion.variante }}
        </dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Cantidad</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ devolucion.cantidad }}</dd>
      </div>
    </dl>

    <div>
      <h4 class="text-sm font-semibold text-gray-900">Motivo</h4>
      <p class="mt-2 rounded-xl border border-gray-100 p-4 text-sm leading-6 text-gray-600">
        {{ devolucion.motivo }}
      </p>
    </div>

    <div v-if="devolucion.resolucion">
      <h4 class="text-sm font-semibold text-gray-900">Resolución</h4>
      <p class="mt-2 rounded-xl border border-gray-100 p-4 text-sm leading-6 text-gray-600">
        {{ devolucion.resolucion }}
      </p>
    </div>

    <div
      v-if="devolucion.estado === 'pendiente'"
      class="flex justify-end gap-3 border-t border-gray-100 pt-5"
    >
      <BaseButton variant="danger" @click="emit('reject', devolucion)"> Rechazar </BaseButton>

      <BaseButton @click="emit('approve', devolucion)"> Aprobar </BaseButton>
    </div>
  </div>
</template>
