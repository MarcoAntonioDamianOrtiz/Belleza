<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
} from '@heroicons/vue/24/outline'

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

const recibidoInput = ref(props.recibido > 0 ? String(props.recibido) : '')

const selectedMethod = computed(() => props.metodos.find((item) => item.id === props.modelValue))

const isCash = computed(() => selectedMethod.value?.nombre.toLowerCase().includes('efectivo'))

const recibidoNumero = computed(() => {
  const value = Number(recibidoInput.value.replace(',', '.'))
  return Number.isFinite(value) ? Math.max(0, value) : 0
})

const change = computed(() => (isCash.value ? Math.max(0, recibidoNumero.value - props.total) : 0))

watch(
  () => props.recibido,
  (value) => {
    if (document.activeElement?.id === 'efectivo-recibido') return
    recibidoInput.value = value > 0 ? String(value) : ''
  },
)

function updateReceived() {
  emit('update:recibido', recibidoNumero.value)
}

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
      <div>
        <label for="efectivo-recibido" class="mb-2 block text-sm font-medium text-gray-700">
          Efectivo recibido
        </label>

        <input
          id="efectivo-recibido"
          v-model="recibidoInput"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          placeholder="0.00"
          class="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
          @input="updateReceived"
          @blur="updateReceived"
        />
      </div>

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
