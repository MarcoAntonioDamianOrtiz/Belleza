<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'

import MovimientoInventarioForm from './MovimientoInventarioForm.vue'

import type { MovimientoFormData, VarianteMovimientoOption } from './MovimientoInventarioForm.vue'

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

interface Props {
  open: boolean
  tipo: TipoMovimiento
  variantes: VarianteMovimientoOption[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: MovimientoFormData]
}>()

function modalTitle() {
  if (props.tipo === 'entrada') return 'Nueva entrada'
  if (props.tipo === 'salida') return 'Nueva salida'
  return 'Nuevo ajuste'
}
</script>

<template>
  <BaseModal :open="open" :title="modalTitle()" max-width="lg" @close="emit('close')">
    <MovimientoInventarioForm
      :key="`${tipo}-${open}`"
      :tipo="tipo"
      :variantes="variantes"
      :loading="loading"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
