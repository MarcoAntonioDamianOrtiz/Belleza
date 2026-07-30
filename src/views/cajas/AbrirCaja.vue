<script setup lang="ts">
import { reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

export interface AperturaCajaData {
  montoInicial: number
  observaciones: string
}

const emit = defineEmits<{
  submit: [data: AperturaCajaData]
  cancel: []
}>()

const form = reactive<AperturaCajaData>({
  montoInicial: 0,
  observaciones: '',
})

function submitForm() {
  if (form.montoInicial < 0) return

  emit('submit', {
    montoInicial: Number(form.montoInicial),
    observaciones: form.observaciones.trim(),
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <BaseInput
      v-model="form.montoInicial"
      type="number"
      min="0"
      step="0.01"
      label="Efectivo inicial"
      required
    />

    <div>
      <label for="apertura-observaciones" class="mb-2 block text-sm font-medium text-gray-700">
        Observaciones
      </label>

      <textarea
        id="apertura-observaciones"
        v-model="form.observaciones"
        rows="3"
        placeholder="Observaciones opcionales"
        class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      />
    </div>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit"> Abrir caja </BaseButton>
    </div>
  </form>
</template>
