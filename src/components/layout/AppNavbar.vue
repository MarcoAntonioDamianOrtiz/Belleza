<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bars3Icon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/vue/24/outline'

import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const menuOpen = ref(false)

const initial = computed(() => authStore.user?.nombre?.charAt(0).toUpperCase() ?? 'U')

const roleLabel = computed(() => (authStore.user?.rol === 1 ? 'Administrador' : 'Empleado'))

async function handleLogout() {
  menuOpen.value = false
  await authStore.signOut()
  await router.replace('/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#ECECEC] bg-white px-3 sm:h-20 sm:px-6"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Abrir menú"
        @click="uiStore.toggleSidebar"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>

      <p class="max-w-[11rem] truncate text-xs font-medium text-gray-700 sm:max-w-none sm:text-sm">Sistema de punto de venta</p>
    </div>

    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100"
        @click="menuOpen = !menuOpen"
      >
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBEFF3] font-semibold text-[#C56B86]"
        >
          {{ initial }}
        </div>

        <div class="hidden text-left md:block">
          <p class="text-sm font-medium text-gray-800">
            {{ authStore.user?.nombre ?? 'Usuario' }}
          </p>
          <p class="text-xs text-gray-500">{{ roleLabel }}</p>
        </div>

        <ChevronDownIcon class="hidden h-4 w-4 text-gray-400 sm:block" />
      </button>

      <div
        v-if="menuOpen"
        class="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
          @click="handleLogout"
        >
          <ArrowRightStartOnRectangleIcon class="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  </header>
</template>
