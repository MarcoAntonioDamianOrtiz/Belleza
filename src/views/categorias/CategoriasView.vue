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

import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '@/api/categorias'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { Categoria } from '@/types/categoria'

const categorias = ref<Categoria[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const confirmOpen = ref(false)
const selected = ref<Categoria | null>(null)

const form = reactive({
  nombre: '',
  descripcion: '',
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return categorias.value

  return categorias.value.filter((item) =>
    [item.nombre, item.descripcion].some((value) => value.toLowerCase().includes(term)),
  )
})

async function loadCategorias() {
  loading.value = true

  try {
    categorias.value = await getCategorias()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar las categorías.'))
  } finally {
    loading.value = false
  }
}

function openNew() {
  selected.value = null
  form.nombre = ''
  form.descripcion = ''
  modalOpen.value = true
}

function openEdit(item: Categoria) {
  selected.value = item
  form.nombre = item.nombre
  form.descripcion = item.descripcion
  modalOpen.value = true
}

async function save() {
  if (!form.nombre.trim()) return

  saving.value = true

  try {
    if (selected.value) {
      await updateCategoria(selected.value.id, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        activo: true,
      })
      await showSuccess('Categoría actualizada correctamente.')
    } else {
      await createCategoria({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        activo: true,
      })
      await showSuccess('Categoría creada correctamente.')
    }

    modalOpen.value = false
    await loadCategorias()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible guardar la categoría.'))
  } finally {
    saving.value = false
  }
}

function requestDelete(item: Categoria) {
  selected.value = item
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!selected.value) return

  saving.value = true

  try {
    await deleteCategoria(selected.value.id)
    confirmOpen.value = false
    await showSuccess('Categoría desactivada correctamente.')
    await loadCategorias()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible desactivar la categoría.'))
  } finally {
    saving.value = false
    selected.value = null
  }
}

onMounted(loadCategorias)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Categorías' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Categorías</h1>
        <p class="mt-1 text-sm text-gray-500">Organiza los productos por categoría.</p>
      </div>

      <BaseButton @click="openNew">
        <PlusIcon class="h-4 w-4" />
        Nueva categoría
      </BaseButton>
    </div>

    <div class="mb-5 max-w-xl">
      <SearchBar v-model="search" placeholder="Buscar categoría..." />
    </div>

    <BaseLoader v-if="loading" text="Cargando categorías..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[650px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Descripción</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filtered" :key="item.id" class="hover:bg-gray-50">
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.nombre }}
              </td>
              <td class="px-5 py-4 text-gray-600">
                {{ item.descripcion || 'Sin descripción' }}
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                    aria-label="Editar categoría"
                    @click="openEdit(item)"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Desactivar categoría"
                    @click="requestDelete(item)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="3" class="px-6 py-12 text-center text-gray-500">
                No se encontraron categorías.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      :open="modalOpen"
      :title="selected ? 'Editar categoría' : 'Nueva categoría'"
      max-width="md"
      @close="modalOpen = false"
    >
      <form class="space-y-5" @submit.prevent="save">
        <BaseInput v-model="form.nombre" label="Nombre" placeholder="Ej. Maquillaje" required />

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700"> Descripción </label>
          <textarea
            v-model="form.descripcion"
            rows="4"
            class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            placeholder="Descripción opcional"
          />
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="modalOpen = false"> Cancelar </BaseButton>
          <BaseButton type="submit" :loading="saving">Guardar</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Desactivar categoría"
      :description="`¿Deseas desactivar ${selected?.nombre ?? 'esta categoría'}?`"
      confirm-text="Desactivar"
      :loading="saving"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
