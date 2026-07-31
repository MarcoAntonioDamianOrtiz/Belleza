<script setup lang="ts">
import { computed } from 'vue'
import {
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
} from '@heroicons/vue/24/outline'

import BaseInput from '@/components/ui/BaseInput.vue'
import { formatCurrency } from '@/utils/formatCurrency'

import type { MetodoPagoCatalogo } from '@/types/metodoPago'

interface Props {
  modelValue: string
  recibido: number
  total: number
  metodos: MetodoPagoCatalogo[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:recibido': [value: number]
}>()

const selectedMethod = computed(() => props.metodos.find((item) => item.id === props.modelValue))

const isCash = computed(() => selectedMethod.value?.nombre.toLowerCase().includes('efectivo'))

const change = computed(() => (isCash.value ? Math.max(0, props.recibido - props.total) : 0))

function methodIcon(name: string) {
  const value = name.toLowerCase()

  if (value.includes('efectivo')) return BanknotesIcon
  if (value.includes('tarjeta')) return CreditCardIcon
  if (value.includes('transferencia')) return DevicePhoneMobileIcon
  return WalletIcon
}
</script>

<template>
  <div>
    <p class="mb-3 text-sm font-medium text-gray-700">Método de pago</p>

    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="method in metodos"
        :key="method.id"
        type="button"
        :class="[
          'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition',
          modelValue === method.id
            ? 'border-[#C56B86] bg-[#FBEFF3] text-[#C56B86]'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        ]"
        @click="emit('update:modelValue', method.id)"
      >
        <component :is="methodIcon(method.nombre)" class="h-6 w-6" />
        {{ method.nombre }}
      </button>
    </div>

    <div v-if="isCash" class="mt-5 grid gap-4 sm:grid-cols-2">
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

    <p v-if="!metodos.length" class="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
      No hay métodos de pago activos.
    </p>
  </div>
</template>
