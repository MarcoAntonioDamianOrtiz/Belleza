<script setup lang="ts">
import { reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import type { Variante } from '@/types/variante'

interface Props {
  variante?: Variante | null
}

const props = withDefaults(defineProps<Props>(), {
  variante: null,
})

const emit = defineEmits<{
  submit: [data: VarianteFormData]
  cancel: []
}>()

export interface VarianteFormData {
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  garantiaMeses: number | null
}

const form = reactive({
  nombre: props.variante?.nombre ?? '',
  sku: props.variante?.sku ?? '',
  codigoBarras: props.variante?.codigoBarras ?? '',
  costo: props.variante?.costo ?? 0,
  precioMenudeo: props.variante?.precioMenudeo ?? 0,
  precioMayoreo: props.variante?.precioMayoreo ?? 0,
  stock: props.variante?.stock ?? 0,
  garantiaMeses: props.variante?.garantiaMeses ?? null,
})

function submitForm() {
  if (!form.nombre.trim() || !form.sku.trim() || !form.codigoBarras.trim()) {
    return
  }

  emit('submit', { ...form })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="grid gap-5 md:grid-cols-2">
      <BaseInput v-model="form.nombre" label="Variante" placeholder="Ej. Rojo Cereza" required />

      <BaseInput v-model="form.sku" label="SKU" placeholder="Ej. LAB-MAT-ROJ" required />

      <BaseInput
        v-model="form.codigoBarras"
        label="Código de barras"
        placeholder="7501234567890"
        required
      />

      <BaseInput v-model="form.costo" label="Costo" type="number" required />

      <BaseInput v-model="form.precioMenudeo" label="Precio menudeo" type="number" required />

      <BaseInput v-model="form.precioMayoreo" label="Precio mayoreo" type="number" required />

      <BaseInput v-model="form.stock" label="Stock" type="number" required />

      <BaseInput
        v-model="form.garantiaMeses"
        label="Garantía (meses)"
        type="number"
        placeholder="Sin garantía"
      />
    </div>

    <p class="text-xs text-gray-500">
      Si el producto no cuenta con garantía, deja el campo de garantía vacío.
    </p>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit">
        {{ variante ? 'Guardar cambios' : 'Agregar variante' }}
      </BaseButton>
    </div>
  </form>
</template>
