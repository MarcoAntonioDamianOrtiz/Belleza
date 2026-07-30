<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { EyeIcon, PlusIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import GarantiaDetalle from './GarantiaDetalle.vue'

import { createMockId, normalizeSearch } from '@/utils/helpers'

import type { EstadoGarantia, Garantia } from '@/types/garantia'

const search = ref('')
const statusFilter = ref<'todas' | EstadoGarantia>('todas')
const newModalOpen = ref(false)
const detailModalOpen = ref(false)
const selectedWarranty = ref<Garantia | null>(null)

const warrantyRequests = ref<Garantia[]>([
  {
    id: 1,
    folio: 'G-0001',
    ventaFolio: 'V-0087',
    fechaSolicitud: '29/07/2026 12:30',
    cliente: 'María López',
    producto: 'Secadora Profesional',
    variante: '2000 W',
    sku: 'SEC-PRO-2000',
    garantiaMeses: 12,
    fechaLimite: '15/05/2027',
    vigente: true,
    motivo: 'El equipo dejó de encender.',
    estado: 'pendiente',
  },
  {
    id: 2,
    folio: 'G-0002',
    ventaFolio: 'V-0061',
    fechaSolicitud: '25/07/2026 10:15',
    cliente: 'Ana Pérez',
    producto: 'Plancha de Cabello',
    variante: 'Cerámica',
    sku: 'PLA-CER-01',
    garantiaMeses: 6,
    fechaLimite: '04/10/2026',
    vigente: true,
    motivo: 'La temperatura no se mantiene estable.',
    estado: 'aprobada',
    resolucion: 'Cambio autorizado por una variante equivalente.',
  },
  {
    id: 3,
    folio: 'G-0003',
    ventaFolio: 'V-0032',
    fechaSolicitud: '18/07/2026 17:40',
    cliente: 'Laura Méndez',
    producto: 'Máquina de Corte',
    variante: 'Inalámbrica',
    sku: 'MAQ-INA-02',
    garantiaMeses: 3,
    fechaLimite: '10/06/2026',
    vigente: false,
    motivo: 'La batería dura menos de cinco minutos.',
    estado: 'rechazada',
    resolucion: 'La garantía se encontraba vencida.',
  },
])

const requestForm = reactive({
  ventaFolio: '',
  cliente: '',
  productoVariante: '',
  garantiaMeses: 12,
  fechaLimite: '',
  motivo: '',
})

const filteredRequests = computed(() => {
  const term = normalizeSearch(search.value)

  return warrantyRequests.value.filter((request) => {
    const statusMatches = statusFilter.value === 'todas' || request.estado === statusFilter.value

    const searchMatches =
      !term ||
      [
        request.folio,
        request.ventaFolio,
        request.cliente,
        request.producto,
        request.variante,
        request.sku,
      ].some((value) => normalizeSearch(value).includes(term))

    return statusMatches && searchMatches
  })
})

const statusOptions = [
  { label: 'Todas las solicitudes', value: 'todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Aprobadas', value: 'aprobada' },
  { label: 'Rechazadas', value: 'rechazada' },
]

function statusConfig(status: EstadoGarantia) {
  if (status === 'aprobada') {
    return { status: 'success' as const, label: 'Aprobada' }
  }

  if (status === 'rechazada') {
    return { status: 'danger' as const, label: 'Rechazada' }
  }

  return { status: 'warning' as const, label: 'Pendiente' }
}

function openDetail(warranty: Garantia) {
  selectedWarranty.value = warranty
  detailModalOpen.value = true
}

function resetRequestForm() {
  requestForm.ventaFolio = ''
  requestForm.cliente = ''
  requestForm.productoVariante = ''
  requestForm.garantiaMeses = 12
  requestForm.fechaLimite = ''
  requestForm.motivo = ''
}

function saveRequest() {
  const [producto = '', variante = ''] = requestForm.productoVariante
    .split(' - ')
    .map((value) => value.trim())

  if (
    !requestForm.ventaFolio.trim() ||
    !requestForm.cliente.trim() ||
    !producto ||
    !variante ||
    !requestForm.motivo.trim()
  ) {
    return
  }

  warrantyRequests.value.unshift({
    id: createMockId(),
    folio: `G-${String(warrantyRequests.value.length + 1).padStart(4, '0')}`,
    ventaFolio: requestForm.ventaFolio.trim(),
    fechaSolicitud: new Date().toLocaleString('es-MX'),
    cliente: requestForm.cliente.trim(),
    producto,
    variante,
    sku: 'PENDIENTE',
    garantiaMeses: Number(requestForm.garantiaMeses),
    fechaLimite: requestForm.fechaLimite || 'Pendiente',
    vigente: true,
    motivo: requestForm.motivo.trim(),
    estado: 'pendiente',
  })

  newModalOpen.value = false
  resetRequestForm()
}

function approveWarranty(warranty: Garantia) {
  warranty.estado = 'aprobada'
  warranty.resolucion = 'Solicitud aprobada. Pendiente de aplicar la resolución correspondiente.'
  detailModalOpen.value = false
}

function rejectWarranty(warranty: Garantia) {
  warranty.estado = 'rechazada'
  warranty.resolucion = 'Solicitud rechazada durante la revisión.'
  detailModalOpen.value = false
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Garantías' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Garantías</h1>
        <p class="mt-1 text-sm text-gray-500">
          Administra solicitudes generadas a partir de ventas realizadas.
        </p>
      </div>

      <BaseButton @click="newModalOpen = true">
        <PlusIcon class="h-4 w-4" />
        Nueva solicitud
      </BaseButton>
    </div>

    <div class="mb-5 flex flex-col gap-3 lg:flex-row">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar folio, venta, cliente, producto o SKU..." />
      </div>

      <div class="w-full lg:w-64">
        <BaseSelect v-model="statusFilter" :options="statusOptions" placeholder="Filtrar estado" />
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1050px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Solicitud</th>
              <th class="px-5 py-4">Venta</th>
              <th class="px-5 py-4">Cliente</th>
              <th class="px-5 py-4">Producto / Variante</th>
              <th class="px-5 py-4">Vigencia</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
              <td class="px-5 py-4">
                <p class="font-medium text-gray-900">{{ request.folio }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ request.fechaSolicitud }}</p>
              </td>
              <td class="px-5 py-4 text-gray-600">{{ request.ventaFolio }}</td>
              <td class="px-5 py-4 text-gray-600">{{ request.cliente }}</td>
              <td class="px-5 py-4">
                <p class="font-medium text-gray-900">{{ request.producto }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ request.variante }} · {{ request.sku }}</p>
              </td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="request.vigente ? 'success' : 'danger'"
                  :label="request.vigente ? 'Vigente' : 'Vencida'"
                />
              </td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="statusConfig(request.estado).status"
                  :label="statusConfig(request.estado).label"
                />
              </td>
              <td class="px-5 py-4 text-right">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                  aria-label="Ver solicitud"
                  @click="openDetail(request)"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>

            <tr v-if="!filteredRequests.length">
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">
                No se encontraron solicitudes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      :open="newModalOpen"
      title="Nueva solicitud de garantía"
      max-width="lg"
      @close="newModalOpen = false"
    >
      <form class="space-y-5" @submit.prevent="saveRequest">
        <div class="grid gap-5 sm:grid-cols-2">
          <BaseInput
            v-model="requestForm.ventaFolio"
            label="Folio de venta"
            placeholder="Ej. V-0088"
            required
          />

          <BaseInput
            v-model="requestForm.cliente"
            label="Cliente"
            placeholder="Nombre del cliente"
            required
          />

          <BaseInput
            v-model="requestForm.productoVariante"
            label="Producto / Variante"
            placeholder="Ej. Secadora Profesional - 2000 W"
            required
          />

          <BaseInput
            v-model="requestForm.garantiaMeses"
            type="number"
            min="1"
            label="Meses de garantía de la variante"
            required
          />

          <BaseInput v-model="requestForm.fechaLimite" type="date" label="Fecha límite" />
        </div>

        <div>
          <label for="garantia-motivo" class="mb-2 block text-sm font-medium text-gray-700">
            Motivo <span class="text-red-500">*</span>
          </label>

          <textarea
            id="garantia-motivo"
            v-model="requestForm.motivo"
            rows="4"
            required
            placeholder="Describe el problema presentado"
            class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
          />
        </div>

        <p class="text-xs leading-5 text-gray-500">
          Los meses de garantía solo se muestran como referencia de la variante vendida; no se
          configuran en este módulo.
        </p>

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="newModalOpen = false"> Cancelar </BaseButton>

          <BaseButton type="submit"> Registrar solicitud </BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      :open="detailModalOpen"
      title="Detalle de garantía"
      max-width="lg"
      @close="detailModalOpen = false"
    >
      <GarantiaDetalle
        v-if="selectedWarranty"
        :garantia="selectedWarranty"
        @approve="approveWarranty"
        @reject="rejectWarranty"
      />
    </BaseModal>
  </section>
</template>
