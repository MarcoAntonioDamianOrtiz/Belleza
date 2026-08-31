<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  MoonIcon,
  RectangleGroupIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SunIcon,
  UsersIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()

function isNavigationActive(itemRoute: string) {
  if (itemRoute === '/') {
    return route.path === '/'
  }

  return route.path === itemRoute || route.path.startsWith(`${itemRoute}/`)
}

const navigationGroups = computed(() => {
  const groups = [
    {
      label: 'Operación',
      items: [
        { name: 'Dashboard', route: '/', icon: HomeIcon },
        { name: 'Ventas', route: '/ventas', icon: ShoppingCartIcon },
        { name: 'Productos', route: '/productos', icon: CubeIcon },
        { name: 'Categorías', route: '/categorias', icon: RectangleGroupIcon },
        { name: 'Inventario', route: '/inventario', icon: ArchiveBoxIcon },
        { name: 'Caja', route: '/caja', icon: BanknotesIcon },
      ],
    },
    {
      label: 'Gestión',
      items: [
        {
          name: 'Métodos de pago',
          route: '/metodos-pago',
          icon: WalletIcon,
          adminOnly: true,
        },
        { name: 'Garantías', route: '/garantias', icon: ShieldCheckIcon },
        { name: 'Devoluciones', route: '/devoluciones', icon: ArrowPathIcon },
        { name: 'Usuarios', route: '/usuarios', icon: UsersIcon, adminOnly: true },
        { name: 'Reportes', route: '/reportes', icon: ChartBarIcon, adminOnly: true },
        {
          name: 'Bitácora',
          route: '/bitacora',
          icon: ClipboardDocumentListIcon,
          adminOnly: true,
        },
        {
          name: 'Configuración',
          route: '/configuracion',
          icon: Cog6ToothIcon,
          adminOnly: true,
        },
      ],
    },
  ]

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || authStore.isAdmin),
    }))
    .filter((group) => group.items.length)
})
</script>

<template>
  <div
    v-if="uiStore.sidebarOpen"
    class="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
    @click="uiStore.closeSidebar"
  />

  <aside
    :class="[
      'app-sidebar fixed inset-y-0 left-0 z-40 flex h-[100dvh] min-h-[100dvh] w-[88vw] max-w-[19rem] flex-col border-r transition-all duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none xl:w-72',
      uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      uiStore.isDarkMode
        ? 'border-[#262A31] bg-[#111315] text-white shadow-2xl'
        : 'border-[#ECECEC] bg-white text-[#2B2B2B] shadow-2xl',
    ]"
  >
    <div
      :class="[
        'app-sidebar-header flex h-[72px] shrink-0 items-center border-b px-4 sm:px-5',
        uiStore.isDarkMode ? 'border-[#262A31]' : 'border-[#ECECEC]',
      ]"
    >
      <div
        :class="[
          'flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold shadow-sm',
          uiStore.isDarkMode ? 'bg-[#EF6B94] text-white' : 'bg-[#C56B86] text-white',
        ]"
      >
        B
      </div>

      <div class="ml-3 min-w-0 flex-1">
        <p
          :class="[
            'truncate text-lg font-semibold leading-tight',
            uiStore.isDarkMode ? 'text-white' : 'text-[#2B2B2B]',
          ]"
        >
          Belleza
        </p>
        <p :class="['mt-0.5 truncate text-[11px]', uiStore.isDarkMode ? 'text-gray-400' : 'text-gray-500']">
          Sistema de punto de venta
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-xl transition lg:hidden"
        :class="
          uiStore.isDarkMode
            ? 'bg-[#1B1E24] text-gray-300 hover:bg-[#242830] hover:text-white'
            : 'bg-[#F7F2F5] text-gray-500 hover:bg-[#F1E5EA] hover:text-[#B65373]'
        "
        aria-label="Cerrar menú"
        @click="uiStore.closeSidebar"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <nav class="app-sidebar-nav min-h-0 flex-1 overflow-hidden px-3 py-3">
      <div
        v-for="(group, groupIndex) in navigationGroups"
        :key="group.label"
        class="sidebar-group"
        :class="
          groupIndex > 0
            ? uiStore.isDarkMode
              ? 'mt-3 border-t border-[#242830] pt-2.5'
              : 'mt-3 border-t border-gray-100 pt-2.5'
            : ''
        "
      >
        <p
          class="sidebar-group-label mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
          :class="uiStore.isDarkMode ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ group.label }}
        </p>

        <div class="space-y-0.5">
          <RouterLink
            v-for="item in group.items"
            :key="item.name"
            :to="item.route"
            class="sidebar-link group flex min-h-10 items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150"
            :class="
              isNavigationActive(item.route)
                ? uiStore.isDarkMode
                  ? 'border-[#EF6B94]/30 bg-[#EF6B94] text-white shadow-md shadow-black/10'
                  : 'border-[#F0CBD6] bg-[#FBEFF3] text-[#B65373] shadow-sm'
                : uiStore.isDarkMode
                  ? 'border-transparent text-gray-300 hover:bg-[#1A1D22] hover:text-white'
                  : 'border-transparent text-gray-600 hover:bg-[#FFF7F9] hover:text-[#B65373]'
            "
            :aria-current="isNavigationActive(item.route) ? 'page' : undefined"
            @click="uiStore.closeSidebar"
          >
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition"
              :class="
                isNavigationActive(item.route)
                  ? uiStore.isDarkMode
                    ? 'bg-white/15 text-white'
                    : 'bg-white text-[#C56B86] shadow-sm'
                  : uiStore.isDarkMode
                    ? 'text-gray-400 group-hover:bg-[#242830] group-hover:text-white'
                    : 'text-gray-500 group-hover:bg-white group-hover:text-[#C56B86]'
              "
            >
              <component :is="item.icon" class="h-[18px] w-[18px]" />
            </span>

            <span class="min-w-0 flex-1 truncate">{{ item.name }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div
      :class="[
        'app-sidebar-footer shrink-0 border-t px-3 py-3',
        uiStore.isDarkMode ? 'border-[#262A31] bg-[#111315]' : 'border-[#ECECEC] bg-white',
      ]"
    >
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition"
        :class="
          uiStore.isDarkMode
            ? 'border-[#2A2F37] bg-[#1A1D22] hover:bg-[#20242A]'
            : 'border-[#F0E4E8] bg-[#FAF7FB] hover:bg-[#F6EEF2]'
        "
        @click="uiStore.toggleTheme"
      >
        <span
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          :class="
            uiStore.isDarkMode
              ? 'bg-[#272C34] text-[#FFD5E2]'
              : 'bg-white text-[#C56B86] shadow-sm'
          "
        >
          <component :is="uiStore.isDarkMode ? SunIcon : MoonIcon" class="h-4 w-4" />
        </span>

        <div class="min-w-0 flex-1">
          <p
            :class="[
              'truncate text-xs font-semibold',
              uiStore.isDarkMode ? 'text-white' : 'text-[#2B2B2B]',
            ]"
          >
            {{ uiStore.isDarkMode ? 'Modo claro' : 'Modo oscuro' }}
          </p>
        </div>

        <span
          class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
          :class="uiStore.isDarkMode ? 'bg-[#EF6B94]' : 'bg-[#E5DDE2]'"
          aria-hidden="true"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="uiStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'"
          />
        </span>
      </button>
    </div>
  </aside>
</template>
