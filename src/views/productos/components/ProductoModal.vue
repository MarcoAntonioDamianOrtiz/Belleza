<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'

import ProductoForm from './ProductoForm.vue'
import VarianteForm from './VarianteForm.vue'

import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'
import type { Variante } from '@/types/variante'
import type { ProductoFormData } from './ProductoForm.vue'
import type { VarianteFormData } from './VarianteForm.vue'

interface Props {
  open: boolean
  mode: 'producto' | 'variante'
  categorias: Categoria[]
  producto?: Producto | null
  variante?: Variante | null
}

const props = withDefaults(defineProps<Props>(), {
  producto: null,
  variante: null,
})

const emit = defineEmits<{
  close: []
  submitProduct: [data: ProductoFormData]
  submitVariant: [data: VarianteFormData]
}>()

function getTitle() {
  if (props.mode === 'producto') {
    return props.producto ? 'Editar producto' : 'Nuevo producto'
  }

  return props.variante ? 'Editar variante' : 'Nueva variante'
}
</script>

<template>
  <BaseModal :open="open" :title="getTitle()" max-width="lg" @close="emit('close')">
    <ProductoForm
      v-if="mode === 'producto'"
      :key="producto?.id ?? 'new-product'"
      :producto="producto"
      :categorias="categorias"
      @submit="emit('submitProduct', $event)"
      @cancel="emit('close')"
    />

    <VarianteForm
      v-else
      :key="variante?.id ?? 'new-variant'"
      :variante="variante"
      @submit="emit('submitVariant', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
