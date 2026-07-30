<script setup lang="ts">
import { computed, ref } from 'vue'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import UsuarioModal from './components/UsuarioModal.vue'

import { createMockId, normalizeSearch } from '@/utils/helpers'

import type { RolUsuario, Usuario, UsuarioFormData } from '@/types/usuario'

const search = ref('')
const roleFilter = ref<'todos' | RolUsuario>('todos')
const page = ref(1)
const pageSize = 5
const modalOpen = ref(false)
const confirmOpen = ref(false)
const selectedUser = ref<Usuario | null>(null)

const users = ref<Usuario[]>([
  {
    id: 1,
    nombre: 'Marco',
    apellidos: 'Damián',
    username: 'marco.admin',
    correo: 'marco@belleza.local',
    rol: 'administrador',
    activo: true,
    ultimoAcceso: '30/07/2026 09:40',
  },
  {
    id: 2,
    nombre: 'Ana',
    apellidos: 'García',
    username: 'ana.caja',
    correo: 'ana@belleza.local',
    rol: 'empleado',
    activo: true,
    ultimoAcceso: '30/07/2026 08:25',
  },
  {
    id: 3,
    nombre: 'Luis',
    apellidos: 'Morales',
    username: 'luis.ventas',
    correo: 'luis@belleza.local',
    rol: 'empleado',
    activo: false,
    ultimoAcceso: '28/07/2026 17:10',
  },
])

const roleOptions = [
  { label: 'Todos los roles', value: 'todos' },
  { label: 'Administradores', value: 'administrador' },
  { label: 'Empleados', value: 'empleado' },
]

const filteredUsers = computed(() => {
  const term = normalizeSearch(search.value)

  return users.value.filter((user) => {
    const roleMatches = roleFilter.value === 'todos' || user.rol === roleFilter.value

    const searchMatches =
      !term ||
      [user.nombre, user.apellidos, user.username, user.correo].some((value) =>
        normalizeSearch(value).includes(term),
      )

    return roleMatches && searchMatches
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))

const paginatedUsers = computed(() => {
  const validPage = Math.min(page.value, totalPages.value)
  const start = (validPage - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

function newUser() {
  selectedUser.value = null
  modalOpen.value = true
}

function editUser(user: Usuario) {
  selectedUser.value = user
  modalOpen.value = true
}

function saveUser(data: UsuarioFormData) {
  if (selectedUser.value) {
    Object.assign(selectedUser.value, {
      nombre: data.nombre,
      apellidos: data.apellidos,
      username: data.username,
      correo: data.correo,
      rol: data.rol,
      activo: data.activo,
    })
  } else {
    users.value.unshift({
      id: createMockId(),
      nombre: data.nombre,
      apellidos: data.apellidos,
      username: data.username,
      correo: data.correo,
      rol: data.rol,
      activo: data.activo,
      ultimoAcceso: 'Sin acceso',
    })
  }

  modalOpen.value = false
  selectedUser.value = null
}

function requestDelete(user: Usuario) {
  selectedUser.value = user
  confirmOpen.value = true
}

function deleteUser() {
  if (!selectedUser.value) return

  users.value = users.value.filter((user) => user.id !== selectedUser.value?.id)

  confirmOpen.value = false
  selectedUser.value = null
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Usuarios' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <p class="mt-1 text-sm text-gray-500">Administra cuentas, roles y estado de acceso.</p>
      </div>

      <BaseButton @click="newUser">
        <PlusIcon class="h-4 w-4" />
        Nuevo usuario
      </BaseButton>
    </div>

    <div class="mb-5 flex flex-col gap-3 lg:flex-row">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar nombre, usuario o correo..." />
      </div>

      <div class="w-full lg:w-64">
        <BaseSelect
          v-model="roleFilter"
          :options="roleOptions"
          placeholder="Filtrar rol"
          @update:model-value="page = 1"
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Usuario</th>
              <th class="px-5 py-4">Correo</th>
              <th class="px-5 py-4">Rol</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4">Último acceso</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ user.nombre }} {{ user.apellidos }}
              </td>
              <td class="px-5 py-4 text-gray-600">{{ user.username }}</td>
              <td class="px-5 py-4 text-gray-600">{{ user.correo }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="user.rol === 'administrador' ? 'info' : 'neutral'"
                  :label="user.rol === 'administrador' ? 'Administrador' : 'Empleado'"
                />
              </td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="user.activo ? 'success' : 'danger'"
                  :label="user.activo ? 'Activo' : 'Inactivo'"
                />
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">{{ user.ultimoAcceso }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                    aria-label="Editar usuario"
                    @click="editUser(user)"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Eliminar usuario"
                    @click="requestDelete(user)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!paginatedUsers.length">
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">
                No se encontraron usuarios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t border-gray-100 px-5 py-4">
        <BasePagination :page="page" :total-pages="totalPages" @change="page = $event" />
      </div>
    </div>

    <UsuarioModal
      :open="modalOpen"
      :usuario="selectedUser"
      @close="modalOpen = false"
      @submit="saveUser"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="Eliminar usuario"
      :description="`¿Deseas eliminar a ${selectedUser?.nombre ?? 'este usuario'}?`"
      confirm-text="Eliminar"
      @confirm="deleteUser"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
