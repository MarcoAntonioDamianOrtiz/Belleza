<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import {
  createMetodoPago,
  deleteMetodoPago,
  getMetodosPago,
  updateMetodoPago,
} from '@/api/metodosPago'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { MetodoPagoCatalogo } from '@/types/metodoPago'

const items = ref<MetodoPagoCatalogo[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const confirmOpen = ref(false)
const selected = ref<MetodoPagoCatalogo | null>(null)

const form = reactive({
  nombre: '',
  activo: true,
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return items.value.filter((item) => !term || item.nombre.toLowerCase().includes(term))
})

async function loadData() {
  loading.value = true

  try {
    items.value = await getMetodosPago()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar los métodos de pago.'))
  } finally {
    loading.value = false
  }
}

function openNew() {
  selected.value = null
  form.nombre = ''
  form.activo = true
  modalOpen.value = true
}

function openEdit(item: MetodoPagoCatalogo) {
  selected.value = item
  form.nombre = item.nombre
  form.activo = item.activo
  modalOpen.value = true
}

async function save() {
  if (!form.nombre.trim()) return

  saving.value = true

  try {
    if (selected.value) {
      await updateMetodoPago(selected.value.id, {
        nombre: form.nombre.trim(),
        activo: form.activo,
      })
      await showSuccess('Método de pago actualizado correctamente.')
    } else {
      await createMetodoPago({
        nombre: form.nombre.trim(),
        activo: true,
      })
      await showSuccess('Método de pago creado correctamente.')
    }

    modalOpen.value = false
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible guardar el método de pago.'))
  } finally {
    saving.value = false
  }
}

function requestDelete(item: MetodoPagoCatalogo) {
  selected.value = item
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!selected.value) return

  saving.value = true

  try {
    await deleteMetodoPago(selected.value.id)
    confirmOpen.value = false
    await showSuccess('Método de pago desactivado correctamente.')
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible desactivar el método de pago.'))
  } finally {
    saving.value = false
    selected.value = null
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Métodos de pago' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Métodos de pago</h1>
        <p class="mt-1 text-sm text-gray-500">
          Administra las formas de pago disponibles para las ventas.
        </p>
      </div>

      <BaseButton @click="openNew">
        <PlusIcon class="h-4 w-4" />
        Nuevo método
      </BaseButton>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar método de pago..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando métodos de pago..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[650px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filtered" :key="item.id" class="hover:bg-gray-50">
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.nombre }}
              </td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="item.activo ? 'success' : 'danger'"
                  :label="item.activo ? 'Activo' : 'Inactivo'"
                />
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                    aria-label="Editar método"
                    @click="openEdit(item)"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Desactivar método"
                    @click="requestDelete(item)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                No se encontraron métodos de pago.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      :open="modalOpen"
      :title="selected ? 'Editar método de pago' : 'Nuevo método de pago'"
      max-width="md"
      @close="modalOpen = false"
    >
      <form class="space-y-5" @submit.prevent="save">
        <BaseInput v-model="form.nombre" label="Nombre" placeholder="Ej. Efectivo" required />

        <label
          v-if="selected"
          class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4"
        >
          <input v-model="form.activo" type="checkbox" class="h-4 w-4 accent-[#C56B86]" />
          <span class="text-sm font-medium text-gray-900"> Método activo </span>
        </label>

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="modalOpen = false"> Cancelar </BaseButton>
          <BaseButton type="submit" :loading="saving">Guardar</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Desactivar método de pago"
      :description="`¿Deseas desactivar ${selected?.nombre ?? 'este método'}?`"
      confirm-text="Desactivar"
      :loading="saving"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
