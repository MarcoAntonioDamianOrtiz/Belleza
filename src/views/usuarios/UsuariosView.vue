<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import SearchBar from '@/components/common/SearchBar.vue'

import UsuarioModal from './components/UsuarioModal.vue'

import { createAdministrador, createUsuario, getUsuarios } from '@/api/usuarios'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { Usuario, UsuarioFormData } from '@/types/usuario'

const users = ref<Usuario[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return users.value

  return users.value.filter((user) =>
    [user.nombre, user.apellido, user.usuario, user.email].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
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

function openCreate() {
  modalOpen.value = true
}

async function saveUser(data: UsuarioFormData) {
  saving.value = true
  try {
    const { tipo, ...payload } = data

    if (tipo === 'admin') {
      await createAdministrador(payload)
      await showSuccess('Administrador creado correctamente.')
    } else {
      await createUsuario(payload)
      await showSuccess('Empleado creado correctamente.')
    }

    modalOpen.value = false
    await loadUsers()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible crear el usuario.'))
  } finally {
    saving.value = false
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
        Nuevo usuario
      </BaseButton>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar nombre, usuario o correo..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando usuarios..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[720px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Usuario</th>
              <th class="px-5 py-4">Correo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in filteredUsers" :key="user.usuario" class="hover:bg-gray-50">
              <td data-label="Nombre" class="px-5 py-4 font-medium text-gray-900">{{ user.nombre }} {{ user.apellido }}</td>
              <td data-label="Usuario" class="px-5 py-4 text-gray-600">@{{ user.usuario }}</td>
              <td data-label="Correo" class="px-5 py-4 text-gray-600">{{ user.email }}</td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="3" class="px-6 py-12 text-center text-gray-500">No se encontraron usuarios.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UsuarioModal
      :open="modalOpen"
      :loading="saving"
      @close="modalOpen = false"
      @submit="saveUser"
    />
  </section>
</template>
