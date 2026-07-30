<script setup lang="ts">
import { computed } from 'vue'
import { BanknotesIcon, CreditCardIcon, DevicePhoneMobileIcon } from '@heroicons/vue/24/outline'

import BaseInput from '@/components/ui/BaseInput.vue'
import { formatCurrency } from '@/utils/formatCurrency'

import type { MetodoPago } from '@/types/venta'

interface Props {
  modelValue: MetodoPago
  recibido: number
  total: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: MetodoPago]
  'update:recibido': [value: number]
}>()

const methods = [
  {
    value: 'efectivo' as const,
    label: 'Efectivo',
    icon: BanknotesIcon,
  },
  {
    value: 'tarjeta' as const,
    label: 'Tarjeta',
    icon: CreditCardIcon,
  },
  {
    value: 'transferencia' as const,
    label: 'Transferencia',
    icon: DevicePhoneMobileIcon,
  },
]

const change = computed(() =>
  props.modelValue === 'efectivo' ? Math.max(0, props.recibido - props.total) : 0,
)
</script>

<template>
  <div>
    <p class="mb-3 text-sm font-medium text-gray-700">Método de pago</p>

    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="method in methods"
        :key="method.value"
        type="button"
        :class="[
          'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition',
          modelValue === method.value
            ? 'border-[#C56B86] bg-[#FBEFF3] text-[#C56B86]'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        ]"
        @click="emit('update:modelValue', method.value)"
      >
        <component :is="method.icon" class="h-6 w-6" />
        {{ method.label }}
      </button>
    </div>

    <div v-if="modelValue === 'efectivo'" class="mt-5 grid gap-4 sm:grid-cols-2">
      <BaseInput
        :model-value="recibido"
        type="number"
        min="0"
        step="0.01"
        label="Efectivo recibido"
        @update:model-value="emit('update:recibido', Number($event))"
      />

      <div class="rounded-xl bg-gray-50 px-4 py-3">
        <p class="text-xs font-medium uppercase text-gray-400">Cambio</p>
        <p class="mt-1 text-lg font-semibold text-gray-900">
          {{ formatCurrency(change) }}
        </p>
      </div>
    </div>
  </div>
</template>
