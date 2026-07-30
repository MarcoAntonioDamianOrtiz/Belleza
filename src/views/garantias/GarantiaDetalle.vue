<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import type { Garantia } from '@/types/garantia'

interface Props {
  garantia: Garantia
}

defineProps<Props>()

const emit = defineEmits<{
  approve: [garantia: Garantia]
  reject: [garantia: Garantia]
}>()

function statusConfig(status: Garantia['estado']) {
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
        <p class="text-sm text-gray-500">Solicitud</p>
        <h3 class="mt-1 text-xl font-semibold text-gray-900">
          {{ garantia.folio }}
        </h3>
      </div>

      <StatusChip
        :status="statusConfig(garantia.estado).status"
        :label="statusConfig(garantia.estado).label"
      />
    </div>

    <dl class="grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Venta</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ garantia.ventaFolio }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Fecha de solicitud</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ garantia.fechaSolicitud }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Cliente</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ garantia.cliente }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Vigencia</dt>
        <dd class="mt-1">
          <StatusChip
            :status="garantia.vigente ? 'success' : 'danger'"
            :label="garantia.vigente ? 'Vigente' : 'Vencida'"
          />
        </dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Producto</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">
          {{ garantia.producto }} - {{ garantia.variante }}
        </dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">SKU</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ garantia.sku }}</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Garantía configurada</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ garantia.garantiaMeses }} meses</dd>
      </div>

      <div>
        <dt class="text-xs font-medium uppercase text-gray-400">Fecha límite</dt>
        <dd class="mt-1 text-sm font-medium text-gray-900">{{ garantia.fechaLimite }}</dd>
      </div>
    </dl>

    <div>
      <h4 class="text-sm font-semibold text-gray-900">Motivo</h4>
      <p class="mt-2 rounded-xl border border-gray-100 p-4 text-sm leading-6 text-gray-600">
        {{ garantia.motivo }}
      </p>
    </div>

    <div v-if="garantia.resolucion">
      <h4 class="text-sm font-semibold text-gray-900">Resolución</h4>
      <p class="mt-2 rounded-xl border border-gray-100 p-4 text-sm leading-6 text-gray-600">
        {{ garantia.resolucion }}
      </p>
    </div>

    <div
      v-if="garantia.estado === 'pendiente'"
      class="flex justify-end gap-3 border-t border-gray-100 pt-5"
    >
      <BaseButton variant="danger" @click="emit('reject', garantia)"> Rechazar </BaseButton>

      <BaseButton @click="emit('approve', garantia)"> Aprobar </BaseButton>
    </div>
  </div>
</template>
