<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import { activarMetodoPago, desactivarMetodoPago, getMetodosPago } from '@/api/metodosPago'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'
import type { MetodoPagoCatalogo } from '@/types/metodoPago'

const items = ref<MetodoPagoCatalogo[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const confirmOpen = ref(false)
const selected = ref<MetodoPagoCatalogo | null>(null)
const filtered = computed(() =>
  items.value.filter((item) =>
    item.nombre.toLowerCase().includes(search.value.trim().toLowerCase()),
  ),
)
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
function requestToggle(item: MetodoPagoCatalogo) {
  selected.value = item
  confirmOpen.value = true
}
async function confirmToggle() {
  if (!selected.value || saving.value) return
  saving.value = true
  try {
    if (selected.value.activo) await desactivarMetodoPago(selected.value.id)
    else await activarMetodoPago(selected.value.id)
    await showSuccess(selected.value.activo ? 'Método desactivado.' : 'Método activado.')
    confirmOpen.value = false
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cambiar el estado del método.'))
  } finally {
    saving.value = false
  }
}
onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Métodos de pago' }]" />
    <div class="mt-4 mb-7">
      <h1 class="text-2xl font-semibold text-gray-900">Métodos de pago</h1>
      <p class="mt-1 text-sm text-gray-500">
        Activa o desactiva los métodos disponibles para cobrar.
      </p>
    </div>
    <div class="mb-5 max-w-xl"><SearchBar v-model="search" placeholder="Buscar método..." /></div>
    <BaseLoader v-if="loading" text="Cargando métodos de pago..." />
    <div v-else class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[480px] text-left text-sm">
          <thead class="border-b bg-gray-50 text-gray-500">
            <tr>
              <th class="px-5 py-4">Nombre</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filtered" :key="item.id">
              <td class="px-5 py-4 font-medium">{{ item.nombre }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="item.activo ? 'success' : 'neutral'"
                  :label="item.activo ? 'Activo' : 'Inactivo'"
                />
              </td>
              <td class="px-5 py-4 text-right">
                <button
                  type="button"
                  :disabled="saving"
                  class="inline-flex items-center gap-2 text-[#B95C7A] disabled:opacity-40"
                  @click="requestToggle(item)"
                >
                  <NoSymbolIcon v-if="item.activo" class="h-4 w-4" />
                  <CheckCircleIcon v-else class="h-4 w-4" />
                  {{ item.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="3" class="px-6 py-10 text-center text-gray-500">
                No se encontraron métodos.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmDialog
      :open="confirmOpen"
      :title="selected?.activo ? 'Desactivar método' : 'Activar método'"
      :description="`¿Deseas ${selected?.activo ? 'desactivar' : 'activar'} ${selected?.nombre ?? 'este método'}?`"
      :confirm-text="selected?.activo ? 'Desactivar' : 'Activar'"
      :loading="saving"
      @confirm="confirmToggle"
      @cancel="confirmOpen = false"
    />
  </section>
</template>
