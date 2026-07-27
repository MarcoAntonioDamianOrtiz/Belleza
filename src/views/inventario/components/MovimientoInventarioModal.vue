<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import MovimientoInventarioForm from './MovimientoInventarioForm.vue'

import type { MovimientoFormData } from './MovimientoInventarioForm.vue'

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

interface Props {
  open: boolean
  tipo: TipoMovimiento
}

const props = defineProps<Props>()

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
  <BaseModal
    :open="open"
    :title="modalTitle()"
    max-width="lg"
    @close="emit('close')"
  >
    <MovimientoInventarioForm
      :key="tipo"
      :tipo="tipo"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
