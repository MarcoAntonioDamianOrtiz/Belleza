<script setup lang="ts">
import { reactive, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import type { Variante } from '@/types/variante'

interface Props {
  variante?: Variante | null
}

const props = withDefaults(defineProps<Props>(), {
  variante: null,
})

export interface VarianteFormData {
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  stockMinimo: number
  garantiaMeses: number | null
}

const emit = defineEmits<{
  submit: [data: VarianteFormData]
  cancel: []
}>()

interface VarianteFormState {
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  stockMinimo: number
  garantiaMeses: number | null | ''
}

const formError = ref('')

const form = reactive<VarianteFormState>({
  nombre: props.variante?.nombre ?? '',
  sku: props.variante?.sku ?? '',
  codigoBarras: props.variante?.codigoBarras ?? '',
  costo: props.variante?.costo ?? 0,
  precioMenudeo: props.variante?.precioMenudeo ?? 0,
  precioMayoreo: props.variante?.precioMayoreo ?? 0,
  stock: props.variante?.stock ?? 0,
  stockMinimo: props.variante?.stockMinimo ?? 0,
  garantiaMeses: props.variante?.garantiaMeses ?? null,
})

function submitForm() {
  formError.value = ''

  if (!form.nombre.trim() || !form.sku.trim() || !form.codigoBarras.trim()) {
    formError.value = 'Completa los campos obligatorios.'
    return
  }

  const costo = Number(form.costo)
  const precioMenudeo = Number(form.precioMenudeo)
  const precioMayoreo = Number(form.precioMayoreo)
  const stock = Number(form.stock)
  const stockMinimo = Number(form.stockMinimo)

  if (precioMenudeo < costo) {
    formError.value = 'El precio de menudeo no puede ser menor al costo.'
    return
  }

  if (precioMayoreo < costo) {
    formError.value = 'El precio de mayoreo no puede ser menor al costo.'
    return
  }

  if (!Number.isInteger(stock) || stock < 0) {
    formError.value = 'El stock inicial debe ser un número entero igual o mayor a cero.'
    return
  }

  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
    formError.value = 'El stock mínimo debe ser un número entero igual o mayor a cero.'
    return
  }

  emit('submit', {
    nombre: form.nombre.trim(),
    sku: form.sku.trim(),
    codigoBarras: form.codigoBarras.trim(),
    costo,
    precioMenudeo,
    precioMayoreo,
    stock,
    stockMinimo,
    garantiaMeses:
      form.garantiaMeses === null || form.garantiaMeses === '' ? null : Number(form.garantiaMeses),
  })
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

      <BaseInput v-model="form.costo" label="Costo" type="number" min="0" step="0.01" required />

      <BaseInput
        v-model="form.precioMenudeo"
        label="Precio menudeo"
        type="number"
        min="0"
        step="0.01"
        required
      />

      <BaseInput
        v-model="form.precioMayoreo"
        label="Precio mayoreo"
        type="number"
        min="0"
        step="0.01"
        required
      />

      <BaseInput
        v-model="form.stock"
        :label="variante ? 'Stock actual' : 'Stock inicial'"
        type="number"
        min="0"
        :disabled="Boolean(variante)"
        required
      />

      <BaseInput v-model="form.stockMinimo" label="Stock mínimo" type="number" min="0" required />

      <BaseInput
        v-model="form.garantiaMeses"
        label="Garantía (meses)"
        type="number"
        min="0"
        placeholder="Sin garantía"
      />
    </div>

    <p v-if="variante" class="text-xs text-gray-500">
      Para modificar existencias, utiliza el módulo de Inventario.
    </p>

    <p class="text-xs text-gray-500">Si no cuenta con garantía, deja el campo vacío.</p>

    <p v-if="formError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
      {{ formError }}
    </p>

    <div class="mobile-action-row flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit">
        {{ variante ? 'Guardar cambios' : 'Agregar variante' }}
      </BaseButton>
    </div>
  </form>
</template>
