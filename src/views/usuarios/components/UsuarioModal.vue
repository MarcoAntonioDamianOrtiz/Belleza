<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import UsuarioForm from './UsuarioForm.vue'

import type { UsuarioFormData } from '@/types/usuario'

interface Props {
  open: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: UsuarioFormData]
}>()
</script>

<template>
  <BaseModal :open="open" title="Nuevo usuario" max-width="lg" @close="emit('close')">
    <UsuarioForm
      :loading="loading"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
