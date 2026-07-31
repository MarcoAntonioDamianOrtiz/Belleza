<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import UsuarioForm from './UsuarioForm.vue'

import type { Usuario, UsuarioFormData } from '@/types/usuario'

interface Props {
  open: boolean
  usuario?: Usuario | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  usuario: null,
  loading: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: UsuarioFormData]
}>()
</script>

<template>
  <BaseModal
    :open="open"
    :title="props.usuario ? 'Editar usuario' : 'Nuevo usuario'"
    max-width="lg"
    @close="emit('close')"
  >
    <UsuarioForm
      :key="props.usuario?.id ?? 'new-user'"
      :usuario="props.usuario"
      :loading="loading"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
