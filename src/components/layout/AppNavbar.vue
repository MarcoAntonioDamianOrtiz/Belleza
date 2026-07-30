<script setup lang="ts">
import { Bars3Icon, BellIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#ECECEC] bg-white px-4 sm:px-6"
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

      <div>
        <p class="text-sm font-medium text-gray-800 sm:font-normal sm:text-gray-500">
          Sistema de punto de venta
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        class="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        <BellIcon class="h-6 w-6" />
      </button>

      <button
        type="button"
        class="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-100"
      >
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBEFF3] font-semibold text-[#C56B86]"
        >
          U
        </div>

        <div class="hidden text-left md:block">
          <p class="text-sm font-medium text-gray-800">Usuario</p>
          <p class="text-xs text-gray-500">Administrador</p>
        </div>

        <ChevronDownIcon class="hidden h-4 w-4 text-gray-400 sm:block" />
      </button>
    </div>
  </header>
</template>
