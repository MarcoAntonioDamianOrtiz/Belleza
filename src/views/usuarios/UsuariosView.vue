<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  CheckCircleIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import UsuarioModal from './components/UsuarioModal.vue'

import {
  activateUsuario,
  createUsuario,
  deactivateUsuario,
  getUsuarios,
  updateUsuario,
} from '@/api/usuarios'
import { useAuthStore } from '@/stores/auth'
import { getFriendlyError } from '@/utils/apiError'
import { useClientPagination } from '@/composables/useClientPagination'
import { showError, showSuccess } from '@/utils/notifications'

import type { Usuario, UsuarioFormData, UsuarioUpdatePayload } from '@/types/usuario'

const authStore = useAuthStore()

const users = ref<Usuario[]>([])
const search = ref('')
const statusFilter = ref<'ACTIVOS' | 'INACTIVOS' | 'TODOS'>('ACTIVOS')
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const selectedUser = ref<Usuario | null>(null)
const confirmOpen = ref(false)
const confirmUser = ref<Usuario | null>(null)
const toggling = ref(false)

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()

  return users.value.filter((user) => {
    const matchesSearch =
      !term ||
      [
        user.nombre,
        user.apellido,
        user.usuario,
        user.email,
        user.rolNombre,
        user.activo ? 'activo' : 'inactivo',
      ].some((value) => value.toLowerCase().includes(term))

    const matchesStatus =
      statusFilter.value === 'TODOS' ||
      (statusFilter.value === 'ACTIVOS' && user.activo) ||
      (statusFilter.value === 'INACTIVOS' && !user.activo)

    return matchesSearch && matchesStatus
  })
})

function canManage(user: Usuario) {
  const current = authStore.user

  if (!current || current.id === user.id) return false

  const currentRole = Number(current.rol)
  const targetRole = Number(user.rol)

  // Superadministrador: administra administradores y empleados,
  // pero nunca a otro superadministrador.
  if (currentRole === 0) {
    return targetRole === 1 || targetRole === 2
  }

  // Administrador: únicamente administra empleados.
  if (currentRole === 1) {
    return targetRole === 2
  }

  return false
}

function roleLabel(user: Usuario) {
  const role = Number(user.rol)

  if (role === 0) return 'Superadministrador'
  if (role === 1) return 'Administrador'
  return 'Empleado'
}

const { page, totalPages, paginatedItems, goToPage } = useClientPagination(filteredUsers, 10)

watch([search, statusFilter], () => goToPage(1))

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

function openCreate() {
  selectedUser.value = null
  modalOpen.value = true
}

function openEdit(user: Usuario) {
  selectedUser.value = user
  modalOpen.value = true
}

function requestDeactivate(user: Usuario) {
  confirmUser.value = user
  confirmOpen.value = true
}

function closeUserModal() {
  modalOpen.value = false
  selectedUser.value = null
}

function cancelDeactivate() {
  confirmOpen.value = false
  confirmUser.value = null
}

async function saveUser(data: UsuarioFormData) {
  saving.value = true

  try {
    if (selectedUser.value) {
      const payload: UsuarioUpdatePayload = {
        nombre: data.nombre,
        apellido: data.apellido,
        usuario: data.usuario,
        email: data.email,
      }

      if (data.password.trim()) {
        payload.password = data.password
      }

      await updateUsuario(selectedUser.value.id, payload)
      await showSuccess('Usuario actualizado correctamente.')
    } else {
      await createUsuario({
        nombre: data.nombre,
        apellido: data.apellido,
        usuario: data.usuario,
        email: data.email,
        password: data.password,
      })
      await showSuccess('Empleado creado correctamente.')
    }

    modalOpen.value = false
    selectedUser.value = null
    await loadUsers()
  } catch (error) {
    await showError(
      getFriendlyError(
        error,
        selectedUser.value
          ? 'No fue posible actualizar el usuario.'
          : 'No fue posible crear el empleado.',
      ),
    )
  } finally {
    saving.value = false
  }
}

async function confirmDeactivate() {
  if (!confirmUser.value) return

  toggling.value = true

  try {
    await deactivateUsuario(confirmUser.value.id)
    confirmOpen.value = false
    confirmUser.value = null
    await showSuccess('Usuario desactivado correctamente.')
    await loadUsers()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible desactivar el usuario.'))
  } finally {
    toggling.value = false
  }
}

async function activate(user: Usuario) {
  toggling.value = true

  try {
    await activateUsuario(user.id)
    await showSuccess('Usuario activado correctamente.')
    await loadUsers()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible activar el usuario.'))
  } finally {
    toggling.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Usuarios' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <p class="mt-1 text-sm text-gray-500">
          Administra las cuentas de usuario y sus permisos de acceso.
        </p>
      </div>

      <BaseButton class="mobile-full-button sm:w-auto" @click="openCreate">
        <PlusIcon class="h-4 w-4" />
        Nuevo empleado
      </BaseButton>
    </div>

    <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
      <div class="w-full md:max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar nombre, usuario, correo o tipo..." />
      </div>

      <label class="w-full md:w-52">
        <span class="sr-only">Filtrar usuarios por estado</span>
        <select
          v-model="statusFilter"
          class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-[#C96886] focus:ring-2 focus:ring-[#F3D3DC]"
        >
          <option value="ACTIVOS">Activos</option>
          <option value="INACTIVOS">Inactivos</option>
          <option value="TODOS">Todos</option>
        </select>
      </label>
    </div>

    <BaseLoader v-if="loading" text="Cargando usuarios..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[980px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Usuario</th>
              <th class="px-5 py-4">Correo</th>
              <th class="px-5 py-4">Tipo</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in paginatedItems" :key="user.id" class="interactive-lift-row">
              <td data-label="Nombre" class="px-5 py-4 font-medium text-gray-900">
                {{ user.nombre }} {{ user.apellido }}
              </td>

              <td data-label="Usuario" class="px-5 py-4 text-gray-600">
                @{{ user.usuario }}
              </td>

              <td data-label="Correo" class="px-5 py-4 text-gray-600">
                {{ user.email }}
              </td>

              <td data-label="Tipo" class="px-5 py-4 text-gray-600">
                {{ roleLabel(user) }}
              </td>

              <td data-label="Estado" class="px-5 py-4">
                <StatusChip
                  :status="user.activo ? 'success' : 'neutral'"
                  :label="user.activo ? 'Activo' : 'Inactivo'"
                />
              </td>

              <td data-label="Acciones" class="px-5 py-4">
                <div v-if="canManage(user)" class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                    aria-label="Editar usuario"
                    title="Editar usuario"
                    @click="openEdit(user)"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>

                  <button
                    v-if="user.activo"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-gray-500 hover:bg-red-50 hover:text-red-500"
                    aria-label="Desactivar usuario"
                    title="Desactivar usuario"
                    :disabled="toggling"
                    @click="requestDeactivate(user)"
                  >
                    <NoSymbolIcon class="h-5 w-5" />
                    <span class="hidden 2xl:inline">Desactivar</span>
                  </button>

                  <button
                    v-else
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-gray-500 hover:bg-green-50 hover:text-green-600"
                    aria-label="Activar usuario"
                    title="Activar usuario"
                    :disabled="toggling"
                    @click="activate(user)"
                  >
                    <CheckCircleIcon class="h-5 w-5" />
                    <span class="hidden 2xl:inline">Activar</span>
                  </button>
                </div>
                <span v-else class="text-gray-400">—</span>
              </td>
            </tr>

            <tr v-if="!filteredUsers.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <template v-if="statusFilter === 'ACTIVOS'">
                  No se encontraron usuarios activos.
                </template>
                <template v-else-if="statusFilter === 'INACTIVOS'">
                  No se encontraron usuarios inactivos.
                </template>
                <template v-else>
                  No se encontraron usuarios.
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filteredUsers.length > 10" class="mt-4">
      <BasePagination :page="page" :total-pages="totalPages" @change="goToPage" />
    </div>

    <UsuarioModal
      :open="modalOpen"
      :usuario="selectedUser"
      :loading="saving"
      @close="closeUserModal"
      @submit="saveUser"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="Desactivar usuario"
      :description="`¿Deseas desactivar a ${confirmUser?.nombre ?? 'este usuario'}? Ya no podrá iniciar sesión hasta que se reactive.`"
      confirm-text="Desactivar"
      :loading="toggling"
      @confirm="confirmDeactivate"
      @cancel="cancelDeactivate"
    />
  </section>
</template>
