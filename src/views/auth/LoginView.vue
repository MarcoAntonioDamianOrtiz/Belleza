<script setup lang="ts">
import { ref } from 'vue'
import { LockClosedIcon, UserIcon } from '@heroicons/vue/24/outline'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const usuario = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

async function handleLogin() {
  if (!usuario.value || !password.value) {
    return
  }

  loading.value = true

  try {
    // Aquí conectaremos auth.ts cuando el backend esté disponible.
    console.log({
      usuario: usuario.value,
      remember: remember.value,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="mb-8 text-center">
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C56B86] text-xl font-bold text-white"
      >
        B
      </div>

      <h1 class="text-2xl font-semibold text-gray-900">Bienvenido</h1>

      <p class="mt-2 text-sm text-gray-500">Ingresa tus datos para acceder al sistema</p>
    </div>

    <div class="rounded-2xl border border-[#ECECEC] bg-white p-8 shadow-sm">
      <form class="space-y-5" @submit.prevent="handleLogin">
        <div class="relative">
          <BaseInput v-model="usuario" label="Usuario" placeholder="Ingresa tu usuario" required />

          <UserIcon class="pointer-events-none absolute right-4 bottom-3 h-5 w-5 text-gray-400" />
        </div>

        <div class="relative">
          <BaseInput
            v-model="password"
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            required
          />

          <LockClosedIcon
            class="pointer-events-none absolute right-4 bottom-3 h-5 w-5 text-gray-400"
          />
        </div>

        <div class="flex items-center justify-between gap-4">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input v-model="remember" type="checkbox" class="h-4 w-4 accent-[#C56B86]" />

            Recordarme
          </label>

          <button type="button" class="text-sm font-medium text-[#C56B86] hover:text-[#B55F79]">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <BaseButton type="submit" :loading="loading" class="w-full"> Iniciar sesión </BaseButton>
      </form>
    </div>

    <p class="mt-6 text-center text-xs text-gray-400">Sistema de punto de venta e inventario</p>
  </div>
</template>
