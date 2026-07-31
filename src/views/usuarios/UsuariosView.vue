<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import UsuarioModal from './components/UsuarioModal.vue'

import { createUsuario, deleteUsuario, getUsuarios, updateUsuario } from '@/api/usuarios'
import { useAuthStore } from '@/stores/auth'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { Usuario, UsuarioFormData } from '@/types/usuario'

const authStore = useAuthStore()

const users = ref<Usuario[]>([])
const search = ref('')
const roleFilter = ref<'todos' | 1 | 2>('todos')
const page = ref(1)
const pageSize = 8
const loading = ref(false)
const saving = ref(false)

const modalOpen = ref(false)
const confirmOpen = ref(false)
const selectedUser = ref<Usuario | null>(null)

const roleOptions = [
  { label: 'Todos los roles', value: 'todos' },
  { label: 'Administrador', value: 1 },
  { label: 'Empleado', value: 2 },
]

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()

  return users.value.filter((user) => {
    const matchesRole = roleFilter.value === 'todos' || user.rol === roleFilter.value

    const matchesSearch =
      !term ||
      [user.nombre, user.apellido, user.usuario, user.email].some((value) =>
        value.toLowerCase().includes(term),
      )

    return matchesRole && matchesSearch
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

watch([search, roleFilter], () => {
  page.value = 1
})

async function loadUsers() {
  loading.value = true

  try {
    users.value = await getUsuarios()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar los usuarios.'))
  } finally {
    loading.value = false
  }
}

function newUser() {
  selectedUser.value = null
  modalOpen.value = true
}

function editUser(user: Usuario) {
  selectedUser.value = user
  modalOpen.value = true
}

async function saveUser(data: UsuarioFormData) {
  saving.value = true

  try {
    if (selectedUser.value) {
      await updateUsuario(selectedUser.value.id, {
        nombre: data.nombre,
        apellido: data.apellido,
        usuario: data.usuario,
        email: data.email,
        rol: data.rol,
        activo: data.activo,
      })
      await showSuccess('Usuario actualizado correctamente.')
    } else {
      await createUsuario({
        nombre: data.nombre,
        apellido: data.apellido,
        usuario: data.usuario,
        email: data.email,
        password: data.password ?? '',
        rol: data.rol,
        activo: data.activo,
      })
      await showSuccess('Usuario creado correctamente.')
    }

    modalOpen.value = false
    selectedUser.value = null
    await loadUsers()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible guardar el usuario.'))
  } finally {
    saving.value = false
  }
}

function requestDelete(user: Usuario) {
  if (user.id === authStore.user?.id) return

  selectedUser.value = user
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!selectedUser.value) return

  saving.value = true

  try {
    await deleteUsuario(selectedUser.value.id)
    confirmOpen.value = false
    await showSuccess('Usuario desactivado correctamente.')
    await loadUsers()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible desactivar el usuario.'))
  } finally {
    saving.value = false
    selectedUser.value = null
  }
}

onMounted(loadUsers)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Usuarios' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <p class="mt-1 text-sm text-gray-500">Administra cuentas, roles y acceso al sistema.</p>
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
        <BaseSelect v-model="roleFilter" :options="roleOptions" placeholder="Filtrar rol" />
      </div>
    </div>

    <BaseLoader v-if="loading" text="Cargando usuarios..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Usuario</th>
              <th class="px-5 py-4">Correo</th>
              <th class="px-5 py-4">Rol</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ user.nombre }} {{ user.apellido }}
              </td>
              <td class="px-5 py-4 text-gray-600">{{ user.usuario }}</td>
              <td class="px-5 py-4 text-gray-600">{{ user.email }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="user.rol === 1 ? 'info' : 'neutral'"
                  :label="user.rol === 1 ? 'Administrador' : 'Empleado'"
                />
              </td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="user.activo ? 'success' : 'danger'"
                  :label="user.activo ? 'Activo' : 'Inactivo'"
                />
              </td>
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
                    :disabled="user.id === authStore.user?.id"
                    :title="
                      user.id === authStore.user?.id
                        ? 'No puedes desactivar tu propio usuario'
                        : 'Desactivar usuario'
                    "
                    class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Desactivar usuario"
                    @click="requestDelete(user)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!paginatedUsers.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
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
      :loading="saving"
      @close="modalOpen = false"
      @submit="saveUser"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="Desactivar usuario"
      :description="`¿Deseas desactivar a ${selectedUser?.nombre ?? 'este usuario'}?`"
      confirm-text="Desactivar"
      :loading="saving"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
