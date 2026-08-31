<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseDateRangeFilter from '@/components/ui/BaseDateRangeFilter.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import DevolucionDetalle from './DevolucionDetalle.vue'

import {
  aprobarDevolucion,
  createDevolucion,
  getDevoluciones,
  rechazarDevolucion,
} from '@/api/devoluciones'
import { formatDate } from '@/utils/formatDate'
import { useAuthStore } from '@/stores/auth'
import { getFriendlyError } from '@/utils/apiError'
import { useClientPagination } from '@/composables/useClientPagination'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { showError, showSuccess } from '@/utils/notifications'
import { getMetodosPagoActivos } from '@/api/metodosPago'
import { buildVentaOptions, loadSoldVariantOptions, loadVentaCatalog } from '@/utils/ventaOptions'

import type { Devolucion, TipoDevolucion } from '@/types/devolucion'
import type { SoldVariantOption, VentaCatalog } from '@/utils/ventaOptions'

interface ReturnLine {
  detalleVentaId: string
  label: string
  cantidad: number
  cantidadVendida: number
}

const authStore = useAuthStore()

const items = ref<Devolucion[]>([])
const catalog = ref<VentaCatalog | null>(null)
const soldVariants = ref<SoldVariantOption[]>([])
const paymentOptions = ref<Array<{ label: string; value: string }>>([])
const selectedLines = ref<ReturnLine[]>([])
const search = ref('')
const statusFilter = ref('TODOS')
const loading = ref(false)
const loadingSale = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const detailOpen = ref(false)
const approveOpen = ref(false)
const rejectOpen = ref(false)
const selected = ref<Devolucion | null>(null)
const formMessage = ref('')
const { dateFrom, dateTo, matchesDate } = useDateRangeFilter('30days')

const form = reactive({
  ventaId: '',
  tipo: 'NORMAL' as TipoDevolucion,
  motivo: '',
  detalleVentaId: '',
  cantidad: 1,
  metodoPagoReembolsoId: '',
})

const ventaOptions = computed(() => buildVentaOptions(catalog.value?.ventas ?? []))

const variantOptions = computed(() =>
  soldVariants.value.map((item) => ({
    label: item.label,
    value: item.detalleVentaId,
  })),
)

const selectedSoldVariant = computed(() =>
  soldVariants.value.find((item) => item.detalleVentaId === form.detalleVentaId),
)

const typeOptions = computed(() => {
  const options = [
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Garantía', value: 'GARANTIA' },
  ]

  if (authStore.isAdmin) {
    options.push({ label: 'Extraordinaria', value: 'EXTRAORDINARIA' })
  }

  return options
})

const statusOptions = [
  { label: 'Todos los estados', value: 'TODOS' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobadas', value: 'APROBADA' },
  { label: 'Rechazadas', value: 'RECHAZADA' },
  { label: 'Finalizadas', value: 'FINALIZADA' },
]

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesStatus = statusFilter.value === 'TODOS' || item.estado === statusFilter.value

    const matchesSearch =
      !term ||
      [item.ventaFolio, item.tipo, item.motivo, item.usuario].some((value) =>
        value.toLowerCase().includes(term),
      )

    return matchesStatus && matchesSearch && matchesDate(item.fecha)
  })
})

function statusFor(estado: Devolucion['estado']) {
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

const { page, totalPages, paginatedItems, goToPage } = useClientPagination(filtered, 10)

async function loadData() {
  loading.value = true

  try {
    const [returns, salesCatalog, paymentMethods] = await Promise.all([
      getDevoluciones(),
      loadVentaCatalog(),
      getMetodosPagoActivos(),
    ])

    items.value = returns
    catalog.value = salesCatalog
    paymentOptions.value = paymentMethods.map((item) => ({ label: item.nombre, value: item.id }))
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar las devoluciones.'))
  } finally {
    loading.value = false
  }
}

async function selectSale(value: string | number) {
  form.ventaId = String(value)
  form.detalleVentaId = ''
  form.cantidad = 1
  selectedLines.value = []
  soldVariants.value = []
  formMessage.value = ''

  if (!form.ventaId || !catalog.value) return

  loadingSale.value = true

  try {
    const { opciones } = await loadSoldVariantOptions(form.ventaId, catalog.value)
    soldVariants.value = opciones

    if (!opciones.length) {
      formMessage.value = 'No fue posible identificar productos disponibles en esta venta.'
    }
  } catch (error) {
    formMessage.value = getFriendlyError(error, 'No fue posible cargar los productos de la venta.')
  } finally {
    loadingSale.value = false
  }
}

function openCreate() {
  form.ventaId = ''
  form.tipo = 'NORMAL'
  form.motivo = ''
  form.detalleVentaId = ''
  form.cantidad = 1
  form.metodoPagoReembolsoId = ''
  soldVariants.value = []
  selectedLines.value = []
  formMessage.value = ''
  modalOpen.value = true
}

function openDetail(item: Devolucion) {
  selected.value = item
  detailOpen.value = true
}


function dismissActiveInput() {
  const activeElement = document.activeElement

  if (activeElement instanceof HTMLElement) {
    activeElement.blur()
  }
}

function addReturnLine() {
  dismissActiveInput()

  const variant = selectedSoldVariant.value
  const quantity = Number(form.cantidad)

  if (!variant || quantity <= 0) {
    formMessage.value = 'Selecciona un producto e indica una cantidad válida.'
    return
  }

  if (quantity > variant.cantidadVendida) {
    formMessage.value = `La cantidad máxima para este producto es ${variant.cantidadVendida}.`
    return
  }

  const existing = selectedLines.value.find((item) => item.detalleVentaId === variant.detalleVentaId)

  if (existing) {
    existing.cantidad = quantity
  } else {
    selectedLines.value.push({
      detalleVentaId: variant.detalleVentaId,
      label: variant.label,
      cantidad: quantity,
      cantidadVendida: variant.cantidadVendida,
    })
  }

  form.detalleVentaId = ''
  form.cantidad = 1
  formMessage.value = ''
}

function removeReturnLine(detalleVentaId: string) {
  selectedLines.value = selectedLines.value.filter((item) => item.detalleVentaId !== detalleVentaId)
}

async function saveReturn() {
  if (!form.ventaId || !form.metodoPagoReembolsoId || !form.motivo.trim() || !selectedLines.value.length) {
    formMessage.value = 'Completa la venta, el método de reembolso, los productos y el motivo.'
    return
  }

  saving.value = true
  formMessage.value = ''

  try {
    await createDevolucion({
      venta_id: form.ventaId,
      metodo_pago_reembolso_id: form.metodoPagoReembolsoId,
      tipo: form.tipo,
      motivo: form.motivo.trim(),
      productos: selectedLines.value.map((item) => ({
        detalle_venta_id: item.detalleVentaId,
        cantidad: item.cantidad,
      })),
    })

    modalOpen.value = false
    await showSuccess('Devolución registrada correctamente.')
    await loadData()
  } catch (error) {
    formMessage.value = getFriendlyError(error, 'No fue posible registrar la devolución.')
  } finally {
    saving.value = false
  }
}

function requestApprove(item: Devolucion) {
  selected.value = item
  approveOpen.value = true
}

function requestReject(item: Devolucion) {
  selected.value = item
  rejectOpen.value = true
}

async function confirmApprove() {
  if (!selected.value) return

  saving.value = true

  try {
    await aprobarDevolucion(selected.value.id)
    approveOpen.value = false
    await showSuccess('Devolución aprobada correctamente.')
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible aprobar la devolución.'))
  } finally {
    saving.value = false
    selected.value = null
  }
}

async function confirmReject() {
  if (!selected.value) return

  saving.value = true

  try {
    await rechazarDevolucion(selected.value.id)
    rejectOpen.value = false
    await showSuccess('Devolución rechazada correctamente.')
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible rechazar la devolución.'))
  } finally {
    saving.value = false
    selected.value = null
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Devoluciones' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Devoluciones</h1>
        <p class="mt-1 text-sm text-gray-500">
          Registra y administra devoluciones relacionadas con ventas.
        </p>
      </div>

      <BaseButton @click="openCreate">
        <PlusIcon class="h-4 w-4" />
        Nueva devolución
      </BaseButton>
    </div>

    <BaseDateRangeFilter
      v-model:from="dateFrom"
      v-model:to="dateTo"
      class="mb-4"
    />

    <div class="mb-5 flex flex-col gap-3 lg:flex-row">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar venta, tipo, usuario o motivo..." />
      </div>

      <div class="w-full lg:w-64">
        <BaseSelect v-model="statusFilter" :options="statusOptions" placeholder="Filtrar estado" />
      </div>
    </div>

    <BaseLoader v-if="loading" text="Cargando devoluciones..." />

    <div v-else class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="mobile-stack-table w-full min-w-[950px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Venta</th>
              <th class="px-5 py-4">Tipo</th>
              <th class="px-5 py-4">Motivo</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in paginatedItems" :key="item.id" class="interactive-lift-row">
              <td data-label="Fecha" class="whitespace-nowrap px-5 py-4 text-gray-600">
                {{ formatDate(item.fecha) }}
              </td>
              <td data-label="Venta" class="px-5 py-4 font-medium text-gray-900">{{ item.ventaFolio }}</td>
              <td data-label="Tipo" class="px-5 py-4 text-gray-600">{{ item.tipo }}</td>
              <td data-label="Motivo" class="max-w-xs truncate px-5 py-4 text-gray-600">{{ item.motivo }}</td>
              <td data-label="Estado" class="px-5 py-4">
                <StatusChip
                  :status="statusFor(item.estado).status"
                  :label="statusFor(item.estado).label"
                />
              </td>
              <td data-label="Acciones" class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                    aria-label="Ver devolución"
                    @click="openDetail(item)"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>

                  <button
                    v-if="authStore.isAdmin && item.estado === 'PENDIENTE'"
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600"
                    aria-label="Aprobar devolución"
                    @click="requestApprove(item)"
                  >
                    <CheckCircleIcon class="h-5 w-5" />
                  </button>

                  <button
                    v-if="authStore.isAdmin && item.estado === 'PENDIENTE'"
                    type="button"
                    class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Rechazar devolución"
                    @click="requestReject(item)"
                  >
                    <XCircleIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No se encontraron devoluciones.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filtered.length > 10" class="mt-4">
      <BasePagination :page="page" :total-pages="totalPages" @change="goToPage" />
    </div>

    <BaseModal :open="modalOpen" title="Nueva devolución" max-width="lg" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="saveReturn">
        <BaseSelect
          :model-value="form.ventaId"
          label="Venta"
          :options="ventaOptions"
          placeholder="Selecciona la venta"
          required
          @update:model-value="selectSale"
        />

        <BaseSelect
          v-model="form.metodoPagoReembolsoId"
          label="Método de reembolso"
          :options="paymentOptions"
          placeholder="Selecciona el método de reembolso"
          required
        />

        <BaseSelect
          v-model="form.tipo"
          label="Tipo de devolución"
          :options="typeOptions"
          required
        />

        <BaseLoader v-if="loadingSale" text="Cargando productos de la venta..." />

        <div v-else class="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px_auto] md:items-end">
          <BaseSelect
            v-model="form.detalleVentaId"
            label="Producto"
            :options="variantOptions"
            :disabled="!form.ventaId || !variantOptions.length"
            placeholder="Selecciona el producto"
          />

          <BaseInput
            v-model="form.cantidad"
            type="number"
            min="1"
            :max="selectedSoldVariant?.cantidadVendida"
            label="Cantidad"
          />

          <BaseButton
            type="button"
            variant="secondary"
            class="w-full md:w-auto"
            @click="addReturnLine"
          >
            <PlusIcon class="h-4 w-4" />
            Agregar producto
          </BaseButton>
        </div>

        <div v-if="selectedLines.length" class="divide-y divide-gray-100 rounded-xl border">
          <div
            v-for="line in selectedLines"
            :key="line.detalleVentaId"
            class="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ line.label }}</p>
              <p class="mt-1 text-xs text-gray-500">Cantidad a devolver: {{ line.cantidad }}</p>
            </div>

            <button
              type="button"
              class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Quitar producto"
              @click="removeReturnLine(line.detalleVentaId)"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Motivo</label>
          <textarea
            v-model="form.motivo"
            rows="4"
            required
            placeholder="Describe el motivo de la devolución"
            class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
          />
        </div>

        <p v-if="formMessage" class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {{ formMessage }}
        </p>

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="modalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">Registrar</BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      :open="detailOpen"
      title="Detalle de devolución"
      max-width="lg"
      @close="detailOpen = false"
    >
      <DevolucionDetalle v-if="selected" :devolucion="selected" />
    </BaseModal>

    <ConfirmDialog
      :open="approveOpen"
      title="Aprobar devolución"
      description="¿Deseas aprobar esta devolución?"
      confirm-text="Aprobar"
      :loading="saving"
      @confirm="confirmApprove"
      @cancel="approveOpen = false"
    />

    <ConfirmDialog
      :open="rejectOpen"
      title="Rechazar devolución"
      description="¿Deseas rechazar esta devolución?"
      confirm-text="Rechazar"
      :loading="saving"
      @confirm="confirmReject"
      @cancel="rejectOpen = false"
    />
  </section>
</template>
