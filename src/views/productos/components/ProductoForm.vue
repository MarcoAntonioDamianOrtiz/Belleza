<script setup lang="ts">
import { reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import type { Producto } from '@/types/producto'

interface Props {
  producto?: Producto | null
}

const props = withDefaults(defineProps<Props>(), {
  producto: null,
})

const emit = defineEmits<{
  submit: [data: ProductoFormData]
  cancel: []
}>()

export interface ProductoFormData {
  nombre: string
  categoria: string
  descripcion: string
}

const form = reactive<ProductoFormData>({
  nombre: props.producto?.nombre ?? '',
  categoria: props.producto?.categoria ?? '',
  descripcion: props.producto?.descripcion ?? '',
})

function submitForm() {
  if (!form.nombre.trim() || !form.categoria.trim()) {
    return
  }

  emit('submit', {
    nombre: form.nombre.trim(),
    categoria: form.categoria.trim(),
    descripcion: form.descripcion.trim(),
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <BaseInput
      v-model="form.nombre"
      label="Nombre del producto"
      placeholder="Ej. Labial Mate"
      required
    />

    <BaseInput v-model="form.categoria" label="Categoría" placeholder="Ej. Maquillaje" required />

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700"> Descripción </label>

      <textarea
        v-model="form.descripcion"
        rows="4"
        placeholder="Descripción opcional del producto"
        class="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      />
    </div>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit">
        {{ producto ? 'Guardar cambios' : 'Crear producto' }}
      </BaseButton>
    </div>
  </form>
</template>
