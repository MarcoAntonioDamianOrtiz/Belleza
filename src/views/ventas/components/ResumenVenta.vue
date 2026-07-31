<script setup lang="ts">
import BaseInput from '@/components/ui/BaseInput.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'
import { formatCurrency } from '@/utils/formatCurrency'

interface Props {
  descuento: number
  subtotal: number
  descuentoAplicado: number
  iva: number
  total: number
  totalArticulos: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:descuento': [value: number]
}>()
</script>

<template>
  <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
    <h2 class="font-semibold text-gray-900">Resumen de venta</h2>

    <div class="mt-5">
      <BaseInput
        :model-value="descuento"
        type="number"
        min="0"
        step="0.01"
        @update:model-value="emit('update:descuento', Number($event))"
      >
        <template #label>
          <span>Descuento</span>
          <HelpTooltip text="Cantidad de dinero que se descontará del subtotal." />
        </template>
      </BaseInput>
    </div>

    <dl class="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
      <div class="flex justify-between gap-4 text-gray-600">
        <dt>Artículos</dt>
        <dd class="font-medium text-gray-900">{{ totalArticulos }}</dd>
      </div>

      <div class="flex justify-between gap-4 text-gray-600">
        <dt>Subtotal de productos</dt>
        <dd class="font-medium text-gray-900">
          {{ formatCurrency(subtotal) }}
        </dd>
      </div>

      <div class="flex justify-between gap-4 text-gray-600">
        <dt>Descuento</dt>
        <dd class="font-medium text-red-600">-{{ formatCurrency(descuentoAplicado) }}</dd>
      </div>

      <div class="flex justify-between gap-4 text-gray-600">
        <dt>IVA</dt>
        <dd class="font-medium text-gray-900">
          {{ formatCurrency(iva) }}
        </dd>
      </div>

      <div class="flex justify-between gap-4 border-t border-gray-100 pt-4">
        <dt class="text-base font-semibold text-gray-900">Total</dt>
        <dd class="text-xl font-semibold text-[#C56B86]">
          {{ formatCurrency(total) }}
        </dd>
      </div>
    </dl>

    <slot />
  </div>
</template>
