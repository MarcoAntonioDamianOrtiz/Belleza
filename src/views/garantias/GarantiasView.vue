<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { CheckCircleIcon, EyeIcon, PlusIcon, XCircleIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import GarantiaDetalle from './GarantiaDetalle.vue'

import {
  aprobarGarantia,
  createGarantia,
  finalizarGarantia,
  getGarantias,
  rechazarGarantia,
} from '@/api/garantias'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'
import { buildVentaOptions, loadSoldVariantOptions, loadVentaCatalog } from '@/utils/ventaOptions'

import type { Garantia, ResolucionGarantia } from '@/types/garantia'
import type { SoldVariantOption, VentaCatalog } from '@/utils/ventaOptions'

type ActionMode = 'crear' | 'aprobar'

const authStore = useAuthStore()

const items = ref<Garantia[]>([])
const catalog = ref<VentaCatalog | null>(null)
const soldVariants = ref<SoldVariantOption[]>([])
const search = ref('')
const statusFilter = ref('TODOS')
const loading = ref(false)
const loadingSale = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const detailOpen = ref(false)
const rejectOpen = ref(false)
const finishOpen = ref(false)
const actionMode = ref<ActionMode>('crear')
const selected = ref<Garantia | null>(null)
const formMessage = ref('')

const form = reactive({
  ventaId: '',
  varianteId: '',
  motivo: '',
  resolucion: 'REEMPLAZO' as ResolucionGarantia,
  observaciones: '',
})

const ventaOptions = computed(() => buildVentaOptions(catalog.value?.ventas ?? []))

const variantOptions = computed(() =>
  soldVariants.value
    .filter((item) => Number(item.garantiaMeses ?? 0) > 0)
    .map((item) => ({
      label: `${item.label} · Garantía: ${item.garantiaMeses} meses`,
      value: item.value,
    })),
)

const statusOptions = [
  { label: 'Todos los estados', value: 'TODOS' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobadas', value: 'APROBADA' },
  { label: 'Rechazadas', value: 'RECHAZADA' },
  { label: 'Finalizadas', value: 'FINALIZADA' },
]

const resolutionOptions = [
  { label: 'Reemplazo', value: 'REEMPLAZO' },
  { label: 'Cambio', value: 'CAMBIO' },
  { label: 'Reparación', value: 'REPARACION' },
]

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesStatus = statusFilter.value === 'TODOS' || item.estado === statusFilter.value

    const matchesSearch =
      !term ||
      [item.ventaFolio, item.producto, item.variante, item.motivo, item.usuario].some((value) =>
        value.toLowerCase().includes(term),
      )

    return matchesStatus && matchesSearch
  })
})

function statusFor(estado: Garantia['estado']) {
  if (estado === 'APROBADA') {
    return { status: 'success' as const, label: 'Aprobada' }
  }

  if (estado === 'RECHAZADA') {
    return { status: 'danger' as const, label: 'Rechazada' }
  }

  if (estado === 'FINALIZADA') {
    return { status: 'info' as const, label: 'Finalizada' }
  }

  return { status: 'warning' as const, label: 'Pendiente' }
}

async function loadData() {
  loading.value = true

  try {
    const [guarantees, salesCatalog] = await Promise.all([getGarantias(), loadVentaCatalog()])

    items.value = guarantees
    catalog.value = salesCatalog
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar las garantías.'))
  } finally {
    loading.value = false
  }
}

async function selectSale(value: string | number) {
  form.ventaId = String(value)
  form.varianteId = ''
  soldVariants.value = []
  formMessage.value = ''

  if (!form.ventaId || !catalog.value) return

  loadingSale.value = true

  try {
    const { opciones } = await loadSoldVariantOptions(form.ventaId, catalog.value)

    soldVariants.value = opciones

    if (!variantOptions.value.length) {
      formMessage.value = 'Esta venta no tiene productos con garantía disponible.'
    }
  } catch (error) {
    formMessage.value = getFriendlyError(error, 'No fue posible cargar los productos de la venta.')
  } finally {
    loadingSale.value = false
  }
}

function openCreate() {
  actionMode.value = 'crear'
  selected.value = null
  form.ventaId = ''
  form.varianteId = ''
  form.motivo = ''
  form.observaciones = ''
  soldVariants.value = []
  formMessage.value = ''
  modalOpen.value = true
}

function openApprove(item: Garantia) {
  actionMode.value = 'aprobar'
  selected.value = item
  form.resolucion = 'REEMPLAZO'
  form.observaciones = ''
  modalOpen.value = true
}

function openDetail(item: Garantia) {
  selected.value = item
  detailOpen.value = true
}

async function submitModal() {
  if (actionMode.value === 'crear' && (!form.ventaId || !form.varianteId || !form.motivo.trim())) {
    formMessage.value = 'Completa la venta, el producto y el motivo.'
    return
  }

  saving.value = true
  formMessage.value = ''

  try {
    if (actionMode.value === 'crear') {
      await createGarantia({
        venta_id: form.ventaId,
        variante_id: form.varianteId,
        motivo: form.motivo.trim(),
        usuario_id: authStore.user?.id,
      })

      await showSuccess('Solicitud de garantía registrada correctamente.')
    } else if (selected.value) {
      await aprobarGarantia(selected.value.id, {
        resolucion: form.resolucion,
        observaciones: form.observaciones.trim(),
      })

      await showSuccess('Garantía aprobada correctamente.')
    }

    modalOpen.value = false
    await loadData()
  } catch (error) {
    formMessage.value = getFriendlyError(error, 'No fue posible guardar la garantía.')
  } finally {
    saving.value = false
  }
}

function requestReject(item: Garantia) {
  selected.value = item
  rejectOpen.value = true
}

function requestFinish(item: Garantia) {
  selected.value = item
  finishOpen.value = true
}

async function confirmReject() {
  if (!selected.value) return

  saving.value = true

  try {
    await rechazarGarantia(selected.value.id)
    rejectOpen.value = false
    await showSuccess('Garantía rechazada correctamente.')
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible rechazar la garantía.'))
  } finally {
    saving.value = false
    selected.value = null
  }
}

async function confirmFinish() {
  if (!selected.value) return

  saving.value = true

  try {
    await finalizarGarantia(selected.value.id)
    finishOpen.value = false
    await showSuccess('Garantía finalizada correctamente.')
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible finalizar la garantía.'))
  } finally {
    saving.value = false
    selected.value = null
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Garantías' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Garantías</h1>
        <p class="mt-1 text-sm text-gray-500">Registra y administra solicitudes de garantía.</p>
      </div>

      <BaseButton @click="openCreate">
        <PlusIcon class="h-4 w-4" />
        Nueva garantía
      </BaseButton>
    </div>

    <div class="mb-5 flex flex-col gap-3 lg:flex-row">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar venta, producto, usuario o motivo..." />
      </div>

      <div class="w-full lg:w-64">
        <BaseSelect v-model="statusFilter" :options="statusOptions" placeholder="Filtrar estado" />
      </div>
    </div>

    <BaseLoader v-if="loading" text="Cargando garantías..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Venta</th>
              <th class="px-5 py-4">Producto</th>
              <th class="px-5 py-4">Motivo</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filtered" :key="item.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ formatDate(item.fecha) }}
              </td>
              <td class="px-5 py-4 font-medium text-gray-900">
                {{ item.ventaFolio }}
              </td>
              <td class="px-5 py-4 text-gray-600">{{ item.producto }} - {{ item.variante }}</td>
              <td class="max-w-xs truncate px-5 py-4 text-gray-600">
                {{ item.motivo }}
              </td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="statusFor(item.estado).status"
                  :label="statusFor(item.estado).label"
                />
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    aria-label="Ver garantía"
                    @click="openDetail(item)"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>

                  <button
                    v-if="authStore.isAdmin && item.estado === 'PENDIENTE'"
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600"
                    aria-label="Aprobar garantía"
                    @click="openApprove(item)"
                  >
                    <CheckCircleIcon class="h-5 w-5" />
                  </button>

                  <button
                    v-if="authStore.isAdmin && item.estado === 'PENDIENTE'"
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Rechazar garantía"
                    @click="requestReject(item)"
                  >
                    <XCircleIcon class="h-5 w-5" />
                  </button>

                  <BaseButton
                    v-if="authStore.isAdmin && item.estado === 'APROBADA'"
                    variant="secondary"
                    @click="requestFinish(item)"
                  >
                    Finalizar
                  </BaseButton>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No se encontraron garantías.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      :open="modalOpen"
      :title="actionMode === 'crear' ? 'Nueva garantía' : 'Aprobar garantía'"
      max-width="lg"
      @close="modalOpen = false"
    >
      <form class="space-y-5" @submit.prevent="submitModal">
        <template v-if="actionMode === 'crear'">
          <BaseSelect
            :model-value="form.ventaId"
            label="Venta"
            :options="ventaOptions"
            placeholder="Selecciona la venta"
            required
            @update:model-value="selectSale"
          />

          <BaseLoader v-if="loadingSale" text="Cargando productos de la venta..." />

          <BaseSelect
            v-else
            v-model="form.varianteId"
            label="Producto con garantía"
            :options="variantOptions"
            :disabled="!form.ventaId || !variantOptions.length"
            placeholder="Selecciona el producto"
            required
          />

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Motivo</label>
            <textarea
              v-model="form.motivo"
              rows="4"
              required
              placeholder="Describe el problema presentado"
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />
          </div>
        </template>

        <template v-else>
          <BaseSelect
            v-model="form.resolucion"
            label="Resolución"
            :options="resolutionOptions"
            required
          />

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              v-model="form.observaciones"
              rows="4"
              placeholder="Describe cómo se resolverá la garantía"
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />
          </div>
        </template>

        <p v-if="formMessage" class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {{ formMessage }}
        </p>

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="modalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">Guardar</BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      :open="detailOpen"
      title="Detalle de garantía"
      max-width="lg"
      @close="detailOpen = false"
    >
      <GarantiaDetalle v-if="selected" :garantia="selected" />
    </BaseModal>

    <ConfirmDialog
      :open="rejectOpen"
      title="Rechazar garantía"
      description="¿Deseas rechazar esta garantía?"
      confirm-text="Rechazar"
      :loading="saving"
      @confirm="confirmReject"
      @cancel="rejectOpen = false"
    />

    <ConfirmDialog
      :open="finishOpen"
      title="Finalizar garantía"
      description="¿Deseas finalizar este proceso de garantía?"
      confirm-text="Finalizar"
      :loading="saving"
      @confirm="confirmFinish"
      @cancel="finishOpen = false"
    />
  </section>
</template>
