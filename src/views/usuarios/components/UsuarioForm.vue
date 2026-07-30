<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import { isValidEmail } from '@/utils/validators'

import type { RolUsuario, Usuario, UsuarioFormData } from '@/types/usuario'

interface Props {
  usuario?: Usuario | null
}

const props = withDefaults(defineProps<Props>(), {
  usuario: null,
})

const emit = defineEmits<{
  submit: [data: UsuarioFormData]
  cancel: []
}>()

const submitted = ref(false)

const form = reactive<UsuarioFormData>({
  nombre: props.usuario?.nombre ?? '',
  apellidos: props.usuario?.apellidos ?? '',
  username: props.usuario?.username ?? '',
  correo: props.usuario?.correo ?? '',
  rol: props.usuario?.rol ?? 'empleado',
  activo: props.usuario?.activo ?? true,
  password: '',
})

const roleOptions = [
  { label: 'Administrador', value: 'administrador' },
  { label: 'Empleado', value: 'empleado' },
]

const emailError = computed(() => {
  if (!submitted.value || !form.correo.trim()) return ''
  return isValidEmail(form.correo) ? '' : 'Ingresa un correo electrónico válido.'
})

function submitForm() {
  submitted.value = true

  if (
    !form.nombre.trim() ||
    !form.apellidos.trim() ||
    !form.username.trim() ||
    !form.correo.trim() ||
    !isValidEmail(form.correo)
  ) {
    return
  }

  emit('submit', {
    nombre: form.nombre.trim(),
    apellidos: form.apellidos.trim(),
    username: form.username.trim(),
    correo: form.correo.trim(),
    rol: form.rol as RolUsuario,
    activo: form.activo,
    password: form.password?.trim() || undefined,
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="grid gap-5 sm:grid-cols-2">
      <BaseInput v-model="form.nombre" label="Nombre" placeholder="Nombre" required />

      <BaseInput v-model="form.apellidos" label="Apellidos" placeholder="Apellidos" required />

      <BaseInput
        v-model="form.username"
        label="Usuario"
        placeholder="Nombre de usuario"
        autocomplete="username"
        required
      />

      <BaseInput
        v-model="form.correo"
        type="email"
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        :error="emailError"
        autocomplete="email"
        required
      />

      <BaseSelect v-model="form.rol" label="Rol" :options="roleOptions" required />

      <BaseInput
        v-model="form.password"
        type="password"
        :label="usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'"
        placeholder="••••••••"
        autocomplete="new-password"
        :required="!usuario"
      />
    </div>

    <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4">
      <input v-model="form.activo" type="checkbox" class="h-4 w-4 accent-[#C56B86]" />

      <span>
        <span class="block text-sm font-medium text-gray-900">Usuario activo</span>
        <span class="mt-0.5 block text-xs text-gray-500">
          Permite que el usuario tenga acceso al sistema.
        </span>
      </span>
    </label>

    <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
      <BaseButton variant="secondary" @click="emit('cancel')"> Cancelar </BaseButton>

      <BaseButton type="submit">
        {{ usuario ? 'Guardar cambios' : 'Crear usuario' }}
      </BaseButton>
    </div>
  </form>
</template>
