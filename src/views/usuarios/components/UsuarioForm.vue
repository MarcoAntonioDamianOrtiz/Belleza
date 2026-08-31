<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { isValidEmail } from '@/utils/validators'

import type { Usuario, UsuarioFormData } from '@/types/usuario'

interface Props {
  usuario?: Usuario | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  usuario: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: UsuarioFormData]
  cancel: []
}>()

const submitted = ref(false)

const form = reactive<UsuarioFormData>({
  nombre: props.usuario?.nombre ?? '',
  apellido: props.usuario?.apellido ?? '',
  usuario: props.usuario?.usuario ?? '',
  email: props.usuario?.email ?? '',
  password: '',
})

const editing = computed(() => Boolean(props.usuario))

const emailError = computed(() => {
  if (!submitted.value || !form.email.trim()) return ''
  return isValidEmail(form.email) ? '' : 'Ingresa un correo electrónico válido.'
})

function submitForm() {
  submitted.value = true

  if (
    !form.nombre.trim() ||
    !form.apellido.trim() ||
    !form.usuario.trim() ||
    !form.email.trim() ||
    !isValidEmail(form.email) ||
    (!editing.value && form.password.trim().length < 8) ||
    (editing.value && form.password.length > 0 && form.password.trim().length < 8)
  ) {
    return
  }

  emit('submit', {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    usuario: form.usuario.trim().replace(/^@+/, ''),
    email: form.email.trim(),
    password: form.password,
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="grid gap-5 sm:grid-cols-2">
      <BaseInput v-model="form.nombre" label="Nombre" placeholder="Nombre" required />
      <BaseInput v-model="form.apellido" label="Apellidos" placeholder="Apellidos" required />

      <BaseInput
        v-model="form.usuario"
        label="Usuario"
        placeholder="Nombre de usuario"
        autocomplete="username"
        required
      />

      <BaseInput
        v-model="form.email"
        type="email"
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        :error="emailError"
        autocomplete="email"
        required
      />

      <div class="sm:col-span-2">
        <BaseInput
          v-model="form.password"
          type="password"
          :label="editing ? 'Nueva contraseña' : 'Contraseña'"
          :placeholder="editing ? 'Dejar vacío para conservar la actual' : 'Mínimo 8 caracteres'"
          :autocomplete="editing ? 'new-password' : 'new-password'"
          :required="!editing"
        />
        <p
          v-if="
            submitted &&
            ((!editing && form.password.trim().length < 8) ||
              (editing && form.password.length > 0 && form.password.trim().length < 8))
          "
          class="mt-1 text-xs text-red-500"
        >
          La contraseña debe tener al menos 8 caracteres.
        </p>
      </div>
    </div>

    <div class="mobile-action-row flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
      <BaseButton type="button" variant="secondary" @click="emit('cancel')">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" :loading="props.loading">
        {{ editing ? 'Guardar cambios' : 'Crear empleado' }}
      </BaseButton>
    </div>
  </form>
</template>
