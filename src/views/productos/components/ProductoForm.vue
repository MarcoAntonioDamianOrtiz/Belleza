<script setup lang="ts">
import { reactive } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'

interface Props {
  producto?: Producto | null
  categorias: Categoria[]
}

const props = withDefaults(defineProps<Props>(), {
  producto: null,
})

export interface ProductoFormData {
  nombre: string
  categoriaId: string
  descripcion: string
}

const emit = defineEmits<{
  submit: [data: ProductoFormData]
  cancel: []
}>()

const form = reactive<ProductoFormData>({
  nombre: props.producto?.nombre ?? '',
  categoriaId: props.producto?.categoriaId ?? '',
  descripcion: props.producto?.descripcion ?? '',
})

const options = props.categorias.map((item) => ({
  label: item.nombre,
  value: item.id,
}))

function submitForm() {
  if (!form.nombre.trim() || !form.categoriaId) return

  emit('submit', {
    nombre: form.nombre.trim(),
    categoriaId: form.categoriaId,
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

    <BaseSelect
      v-model="form.categoriaId"
      label="Categoría"
      :options="options"
      placeholder="Selecciona una categoría"
      required
    />

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700"> Descripción </label>

      <textarea
        v-model="form.descripcion"
        rows="4"
        placeholder="Descripción opcional del producto"
        class="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      />
    </div>

    <div class="mobile-action-row flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit">
        {{ producto ? 'Guardar cambios' : 'Crear producto' }}
      </BaseButton>
    </div>
  </form>
</template>
