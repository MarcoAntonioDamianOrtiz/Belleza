<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { LockClosedIcon, UserIcon } from '@heroicons/vue/24/outline'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useAuthStore } from '@/stores/auth'
import { getFriendlyError } from '@/utils/apiError'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const usuario = ref('')
const password = ref('')
const remember = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!usuario.value.trim() || !password.value) {
    errorMessage.value = 'Ingresa tu usuario y contraseña.'
    return
  }

  try {
    await authStore.signIn(
      {
        usuario: usuario.value.trim(),
        password: password.value,
      },
      remember.value,
    )

    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/'

    await router.replace(redirect)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      errorMessage.value = 'Usuario o contraseña incorrectos.'
      return
    }

    errorMessage.value = getFriendlyError(
      error,
      'No fue posible iniciar sesión. Intenta nuevamente.',
    )
  }
}
</script>

<template>
  <div class="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md">
    <div class="mb-6 text-center sm:mb-8 md:mb-10 lg:mb-8">
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C56B86] text-xl font-bold text-white md:h-16 md:w-16 md:text-2xl lg:h-14 lg:w-14 lg:text-xl">
        B
      </div>

      <h1 class="text-2xl font-semibold text-gray-900 md:text-3xl lg:text-2xl">
        Bienvenido
      </h1>

      <p class="mt-2 px-2 text-sm text-gray-500 md:text-base lg:text-sm">
        Ingresa tus datos para acceder al sistema
      </p>
    </div>

    <div class="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-sm sm:p-8 md:p-10 lg:p-8">
      <form class="space-y-5" @submit.prevent="handleLogin">
        <div class="relative">
          <BaseInput v-model="usuario" label="Usuario" placeholder="Ingresa tu usuario" autocomplete="username"
            required />

          <UserIcon class="pointer-events-none absolute right-4 bottom-3 h-5 w-5 text-gray-400" />
        </div>

        <div class="relative">
          <BaseInput v-model="password" label="Contraseña" type="password" placeholder="Ingresa tu contraseña"
            autocomplete="current-password" required />

          <LockClosedIcon class="pointer-events-none absolute right-4 bottom-3 h-5 w-5 text-gray-400" />
        </div>

        <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input v-model="remember" type="checkbox" class="h-4 w-4 accent-[#C56B86]" />

          Recordarme
        </label>

        <BaseButton type="submit" :loading="authStore.loading" class="w-full">
          Iniciar sesión
        </BaseButton>
      </form>
    </div>

    <p class="mt-6 text-center text-xs text-gray-400 md:text-sm lg:text-xs">
      Sistema de punto de venta e inventario
    </p>
  </div>
</template>
