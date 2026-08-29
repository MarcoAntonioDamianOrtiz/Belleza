<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { isValidEmail } from '@/utils/validators'

import type { UsuarioFormData } from '@/types/usuario'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  submit: [data: UsuarioFormData]
  cancel: []
}>()

const submitted = ref(false)

const form = reactive<UsuarioFormData>({
  nombre: '',
  apellido: '',
  usuario: '',
  email: '',
  password: '',
  tipo: 'empleado',
})

const emailError = computed(() => {
  if (!submitted.value || !form.email.trim()) return ''
  return isValidEmail(form.email) ? '' : 'Ingresa un correo electrónico válido.'
})

const submitLabel = computed(() => 'Crear usuario')

function submitForm() {
  submitted.value = true

  if (
    !form.nombre.trim() ||
    !form.apellido.trim() ||
    !form.usuario.trim() ||
    !form.email.trim() ||
    !isValidEmail(form.email) ||
    form.password.trim().length < 8
  ) {
    return
  }

  emit('submit', {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    usuario: form.usuario.trim().replace(/^@+/, ''),
    email: form.email.trim(),
    password: form.password,
    tipo: form.tipo,
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
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          autocomplete="new-password"
          required
        />
        <p v-if="submitted && form.password.trim().length < 8" class="mt-1 text-xs text-red-500">
          La contraseña debe tener al menos 8 caracteres.
        </p>
      </div>
    </div>

    <fieldset>
      <legend class="mb-2 text-sm font-medium text-gray-700">Tipo de usuario</legend>
      <div class="grid gap-3 sm:grid-cols-2">
        <label
          class="cursor-pointer rounded-xl border p-4 transition"
          :class="
            form.tipo === 'empleado'
              ? 'border-[#C96886] bg-[#FFF5F8]'
              : 'border-gray-200 bg-white hover:border-gray-300'
          "
        >
          <div class="flex items-start gap-3">
            <input
              v-model="form.tipo"
              type="radio"
              value="empleado"
              class="mt-1 h-4 w-4 accent-[#C96886]"
            />
            <div>
              <p class="font-medium text-gray-900">Empleado</p>
              <p class="mt-1 text-xs text-gray-500">Puede realizar las operaciones habituales del sistema.</p>
            </div>
          </div>
        </label>

        <label
          class="cursor-pointer rounded-xl border p-4 transition"
          :class="
            form.tipo === 'admin'
              ? 'border-[#C96886] bg-[#FFF5F8]'
              : 'border-gray-200 bg-white hover:border-gray-300'
          "
        >
          <div class="flex items-start gap-3">
            <input
              v-model="form.tipo"
              type="radio"
              value="admin"
              class="mt-1 h-4 w-4 accent-[#C96886]"
            />
            <div>
              <p class="font-medium text-gray-900">Administrador</p>
              <p class="mt-1 text-xs text-gray-500">Tiene acceso a la administración y configuración del sistema.</p>
            </div>
          </div>
        </label>
      </div>
    </fieldset>
    <div class="mobile-action-row flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
      <BaseButton type="button" variant="secondary" @click="emit('cancel')">Cancelar</BaseButton>
      <BaseButton type="submit" :loading="props.loading">{{ submitLabel }}</BaseButton>
    </div>
  </form>
</template>
