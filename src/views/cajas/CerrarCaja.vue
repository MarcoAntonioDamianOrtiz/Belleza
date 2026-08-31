<script setup lang="ts">
import { computed, reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { formatCurrency } from '@/utils/formatCurrency'

interface Props {
  efectivoEsperado: number
}

const props = defineProps<Props>()

export interface CierreCajaData {
  efectivoContado: number
  observaciones: string
}

const emit = defineEmits<{
  submit: [data: CierreCajaData]
  cancel: []
}>()

const form = reactive<CierreCajaData>({
  efectivoContado: 0,
  observaciones: '',
})

const difference = computed(() => Number(form.efectivoContado) - props.efectivoEsperado)

function submitForm() {
  if (form.efectivoContado < 0) return

  emit('submit', {
    efectivoContado: Number(form.efectivoContado),
    observaciones: form.observaciones.trim(),
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-xl bg-gray-50 px-4 py-3">
        <p class="text-xs font-medium uppercase text-gray-400">Efectivo esperado</p>
        <p class="mt-1 text-lg font-semibold text-gray-900">
          {{ formatCurrency(efectivoEsperado) }}
        </p>
      </div>

      <div class="rounded-xl bg-gray-50 px-4 py-3">
        <p class="text-xs font-medium uppercase text-gray-400">Diferencia</p>
        <p
          :class="[
            'mt-1 text-lg font-semibold',
            difference === 0 ? 'text-gray-900' : difference > 0 ? 'text-green-600' : 'text-red-600',
          ]"
        >
          {{ difference > 0 ? '+' : '' }}{{ formatCurrency(difference) }}
        </p>
      </div>
    </div>

    <BaseInput
      v-model="form.efectivoContado"
      type="number"
      min="0"
      step="0.01"
      label="Efectivo contado"
      required
    />

    <div>
      <label for="cierre-observaciones" class="mb-2 block text-sm font-medium text-gray-700">
        Observaciones
      </label>

      <textarea
        id="cierre-observaciones"
        v-model="form.observaciones"
        rows="3"
        placeholder="Explica cualquier diferencia encontrada"
        class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      />
    </div>

    <div class="tablet-action-stack flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit"> Cerrar caja </BaseButton>
    </div>
  </form>
</template>
