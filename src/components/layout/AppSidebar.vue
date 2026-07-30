<script setup lang="ts">
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const navigation = [
  { name: 'Dashboard', route: '/', icon: HomeIcon },
  { name: 'Ventas', route: '/ventas', icon: ShoppingCartIcon },
  { name: 'Productos', route: '/productos', icon: CubeIcon },
  { name: 'Inventario', route: '/inventario', icon: ArchiveBoxIcon },
  { name: 'Caja', route: '/caja', icon: BanknotesIcon },
  { name: 'Garantías', route: '/garantias', icon: ShieldCheckIcon },
  { name: 'Devoluciones', route: '/devoluciones', icon: ArrowPathIcon },
  { name: 'Usuarios', route: '/usuarios', icon: UsersIcon },
  { name: 'Reportes', route: '/reportes', icon: ChartBarIcon },
  { name: 'Bitácora', route: '/bitacora', icon: ClipboardDocumentListIcon },
  { name: 'Configuración', route: '/configuracion', icon: Cog6ToothIcon },
]
</script>

<template>
  <div
    v-if="uiStore.sidebarOpen"
    class="fixed inset-0 z-30 bg-black/30 lg:hidden"
    @click="uiStore.closeSidebar"
  />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-[#ECECEC] bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:translate-x-0',
      uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex h-20 items-center border-b border-[#ECECEC] px-6">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C56B86] text-lg font-bold text-white"
      >
        B
      </div>

      <span class="ml-3 text-xl font-semibold text-[#2B2B2B]">Belleza</span>

      <button
        type="button"
        class="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden"
        aria-label="Cerrar menú"
        @click="uiStore.closeSidebar"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-4">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.route"
        class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-[#FBEFF3] hover:text-[#C56B86]"
        active-class="bg-[#FBEFF3] text-[#C56B86]"
        @click="uiStore.closeSidebar"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="border-t border-[#ECECEC] p-4">
      <p class="px-4 text-xs text-gray-400">Belleza POS</p>
    </div>
  </aside>
</template>
