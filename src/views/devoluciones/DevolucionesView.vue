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

import DevolucionDetalle from './DevolucionDetalle.vue'

import { createMockId, normalizeSearch } from '@/utils/helpers'

import type { Devolucion, EstadoDevolucion, TipoDevolucion } from '@/types/devolucion'

const search = ref('')
const statusFilter = ref<'todas' | EstadoDevolucion>('todas')
const newModalOpen = ref(false)
const detailModalOpen = ref(false)
const selectedReturn = ref<Devolucion | null>(null)

const returns = ref<Devolucion[]>([
  {
    id: 1,
    folio: 'D-0001',
    ventaFolio: 'V-0091',
    fechaSolicitud: '29/07/2026 15:20',
    cliente: 'Patricia Ruiz',
    producto: 'Labial Mate',
    variante: 'Rosa Nude',
    cantidad: 1,
    tipo: 'cambio',
    motivo: 'El tono entregado no corresponde al solicitado.',
    estado: 'pendiente',
  },
  {
    id: 2,
    folio: 'D-0002',
    ventaFolio: 'V-0078',
    fechaSolicitud: '26/07/2026 11:10',
    cliente: 'Daniela Flores',
    producto: 'Crema Facial',
    variante: 'Hidratante 250 ml',
    cantidad: 1,
    tipo: 'reembolso',
    motivo: 'El sello del producto estaba dañado.',
    estado: 'aprobada',
    resolucion: 'Reembolso autorizado por el monto pagado.',
  },
  {
    id: 3,
    folio: 'D-0003',
    ventaFolio: 'V-0042',
    fechaSolicitud: '20/07/2026 17:05',
    cliente: 'Claudia Hernández',
    producto: 'Labial Mate',
    variante: 'Ciruela',
    cantidad: 2,
    tipo: 'cambio',
    motivo: 'Solicitud fuera del periodo permitido.',
    estado: 'rechazada',
    resolucion: 'La solicitud fue registrada fuera del plazo de devolución.',
  },
])

const form = reactive({
  ventaFolio: '',
  cliente: '',
  producto: '',
  variante: '',
  cantidad: 1,
  tipo: 'cambio' as TipoDevolucion,
  motivo: '',
})

const statusOptions = [
  { label: 'Todas las devoluciones', value: 'todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Aprobadas', value: 'aprobada' },
  { label: 'Rechazadas', value: 'rechazada' },
]

const typeOptions = [
  { label: 'Cambio de producto', value: 'cambio' },
  { label: 'Reembolso', value: 'reembolso' },
]

const filteredReturns = computed(() => {
  const term = normalizeSearch(search.value)

  return returns.value.filter((item) => {
    const statusMatches = statusFilter.value === 'todas' || item.estado === statusFilter.value

    const searchMatches =
      !term ||
      [item.folio, item.ventaFolio, item.cliente, item.producto, item.variante, item.motivo].some(
        (value) => normalizeSearch(value).includes(term),
      )

    return statusMatches && searchMatches
  })
})

function statusConfig(status: EstadoDevolucion) {
  if (status === 'aprobada') {
    return { status: 'success' as const, label: 'Aprobada' }
  }

  if (status === 'rechazada') {
    return { status: 'danger' as const, label: 'Rechazada' }
  }

  return { status: 'warning' as const, label: 'Pendiente' }
}

function openDetail(item: Devolucion) {
  selectedReturn.value = item
  detailModalOpen.value = true
}

function resetForm() {
  form.ventaFolio = ''
  form.cliente = ''
  form.producto = ''
  form.variante = ''
  form.cantidad = 1
  form.tipo = 'cambio'
  form.motivo = ''
}

function saveReturn() {
  if (
    !form.ventaFolio.trim() ||
    !form.cliente.trim() ||
    !form.producto.trim() ||
    !form.variante.trim() ||
    form.cantidad <= 0 ||
    !form.motivo.trim()
  ) {
    return
  }

  returns.value.unshift({
    id: createMockId(),
    folio: `D-${String(returns.value.length + 1).padStart(4, '0')}`,
    ventaFolio: form.ventaFolio.trim(),
    fechaSolicitud: new Date().toLocaleString('es-MX'),
    cliente: form.cliente.trim(),
    producto: form.producto.trim(),
    variante: form.variante.trim(),
    cantidad: Number(form.cantidad),
    tipo: form.tipo,
    motivo: form.motivo.trim(),
    estado: 'pendiente',
  })

  newModalOpen.value = false
  resetForm()
}

function approveReturn(item: Devolucion) {
  item.estado = 'aprobada'
  item.resolucion = 'Devolución aprobada. Pendiente de aplicar el cambio o reembolso.'
  detailModalOpen.value = false
}

function rejectReturn(item: Devolucion) {
  item.estado = 'rechazada'
  item.resolucion = 'Devolución rechazada durante la revisión.'
  detailModalOpen.value = false
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Devoluciones' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Devoluciones</h1>
        <p class="mt-1 text-sm text-gray-500">Registra solicitudes y consulta su historial.</p>
      </div>

      <BaseButton @click="newModalOpen = true">
        <PlusIcon class="h-4 w-4" />
        Registrar devolución
      </BaseButton>
    </div>

    <div class="mb-5 flex flex-col gap-3 lg:flex-row">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar folio, venta, cliente o producto..." />
      </div>

      <div class="w-full lg:w-64">
        <BaseSelect v-model="statusFilter" :options="statusOptions" placeholder="Filtrar estado" />
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Folio</th>
              <th class="px-5 py-4">Venta</th>
              <th class="px-5 py-4">Cliente</th>
              <th class="px-5 py-4">Producto / Variante</th>
              <th class="px-5 py-4">Tipo</th>
              <th class="px-5 py-4">Estado</th>
              <th class="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in filteredReturns" :key="item.id" class="hover:bg-gray-50">
              <td class="px-5 py-4">
                <p class="font-medium text-gray-900">{{ item.folio }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ item.fechaSolicitud }}</p>
              </td>
              <td class="px-5 py-4 text-gray-600">{{ item.ventaFolio }}</td>
              <td class="px-5 py-4 text-gray-600">{{ item.cliente }}</td>
              <td class="px-5 py-4">
                <p class="font-medium text-gray-900">{{ item.producto }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ item.variante }} · {{ item.cantidad }} pza.
                </p>
              </td>
              <td class="px-5 py-4 capitalize text-gray-600">{{ item.tipo }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="statusConfig(item.estado).status"
                  :label="statusConfig(item.estado).label"
                />
              </td>
              <td class="px-5 py-4 text-right">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                  aria-label="Ver devolución"
                  @click="openDetail(item)"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>

            <tr v-if="!filteredReturns.length">
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">
                No se encontraron devoluciones.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      :open="newModalOpen"
      title="Registrar devolución"
      max-width="lg"
      @close="newModalOpen = false"
    >
      <form class="space-y-5" @submit.prevent="saveReturn">
        <div class="grid gap-5 sm:grid-cols-2">
          <BaseInput
            v-model="form.ventaFolio"
            label="Folio de venta"
            placeholder="Ej. V-0092"
            required
          />

          <BaseInput
            v-model="form.cliente"
            label="Cliente"
            placeholder="Nombre del cliente"
            required
          />

          <BaseInput
            v-model="form.producto"
            label="Producto"
            placeholder="Ej. Labial Mate"
            required
          />

          <BaseInput
            v-model="form.variante"
            label="Variante"
            placeholder="Ej. Rosa Nude"
            required
          />

          <BaseInput v-model="form.cantidad" type="number" min="1" label="Cantidad" required />

          <BaseSelect
            v-model="form.tipo"
            label="Tipo de devolución"
            :options="typeOptions"
            required
          />
        </div>

        <div>
          <label for="devolucion-motivo" class="mb-2 block text-sm font-medium text-gray-700">
            Motivo <span class="text-red-500">*</span>
          </label>

          <textarea
            id="devolucion-motivo"
            v-model="form.motivo"
            rows="4"
            required
            placeholder="Describe el motivo de la devolución"
            class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
          />
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="newModalOpen = false"> Cancelar </BaseButton>

          <BaseButton type="submit"> Registrar </BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      :open="detailModalOpen"
      title="Detalle de devolución"
      max-width="lg"
      @close="detailModalOpen = false"
    >
      <DevolucionDetalle
        v-if="selectedReturn"
        :devolucion="selectedReturn"
        @approve="approveReturn"
        @reject="rejectReturn"
      />
    </BaseModal>
  </section>
</template>
