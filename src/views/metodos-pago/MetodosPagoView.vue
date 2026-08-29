<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import { deleteMetodoPago, getMetodosPago, updateMetodoPago } from '@/api/metodosPago'
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


function openEdit(item: MetodoPagoCatalogo) {
  selected.value = item
  form.nombre = item.nombre
  form.activo = item.activo
  modalOpen.value = true
}

async function save() {
  if (!selected.value) return

  saving.value = true

  try {
    await updateMetodoPago(selected.value.id, form.activo)
    await showSuccess('Método de pago actualizado correctamente.')
    modalOpen.value = false
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible actualizar el método de pago.'))
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

    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar método de pago..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando métodos de pago..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[650px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filtered" :key="item.id" class="hover:bg-gray-50">
              <td data-label="Nombre" class="px-5 py-4 font-medium text-gray-900">
                {{ item.nombre }}
              </td>
              <td data-label="Estado" class="px-5 py-4">
                <StatusChip
                  :status="item.activo ? 'success' : 'danger'"
                  :label="item.activo ? 'Activo' : 'Inactivo'"
                />
              </td>
              <td data-label="Acciones" class="px-5 py-4">
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
      title="Estado del método de pago"
      max-width="md"
      @close="modalOpen = false"
    >
      <form class="space-y-5" @submit.prevent="save">
        <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p class="text-xs uppercase text-gray-400">Método</p>
          <p class="mt-1 font-medium text-gray-900">{{ form.nombre }}</p>
          <p class="mt-1 text-xs text-gray-500">Puedes activar o desactivar este método de pago.</p>
        </div>

        <label
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
