<script setup lang="ts">
import { computed, ref } from 'vue'
import { EyeIcon } from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import { normalizeSearch } from '@/utils/helpers'

type BitacoraTipo = 'creacion' | 'edicion' | 'eliminacion' | 'acceso' | 'operacion'

interface BitacoraItem {
  id: number
  fecha: string
  usuario: string
  modulo: string
  accion: string
  tipo: BitacoraTipo
  descripcion: string
}

const search = ref('')
const moduleFilter = ref('todos')
const page = ref(1)
const pageSize = 6
const detailOpen = ref(false)
const selectedItem = ref<BitacoraItem | null>(null)

const records = ref<BitacoraItem[]>([
  {
    id: 1,
    fecha: '30/07/2026 09:45',
    usuario: 'Marco Damián',
    modulo: 'Ventas',
    accion: 'Registrar venta',
    tipo: 'operacion',
    descripcion: 'Registró la venta V-0001 por $197.20.',
  },
  {
    id: 2,
    fecha: '30/07/2026 09:20',
    usuario: 'Marco Damián',
    modulo: 'Productos',
    accion: 'Editar variante',
    tipo: 'edicion',
    descripcion: 'Actualizó el precio de menudeo de Labial Mate - Rojo Cereza.',
  },
  {
    id: 3,
    fecha: '30/07/2026 08:30',
    usuario: 'Ana García',
    modulo: 'Caja',
    accion: 'Abrir caja',
    tipo: 'operacion',
    descripcion: 'Abrió la caja con un monto inicial de $500.00.',
  },
  {
    id: 4,
    fecha: '29/07/2026 17:40',
    usuario: 'Marco Damián',
    modulo: 'Usuarios',
    accion: 'Crear usuario',
    tipo: 'creacion',
    descripcion: 'Creó la cuenta ana.caja con rol Empleado.',
  },
  {
    id: 5,
    fecha: '29/07/2026 16:15',
    usuario: 'Luis Morales',
    modulo: 'Inventario',
    accion: 'Registrar salida',
    tipo: 'operacion',
    descripcion: 'Registró una salida de 2 unidades por producto dañado.',
  },
  {
    id: 6,
    fecha: '29/07/2026 08:02',
    usuario: 'Marco Damián',
    modulo: 'Autenticación',
    accion: 'Inicio de sesión',
    tipo: 'acceso',
    descripcion: 'Inició sesión correctamente.',
  },
  {
    id: 7,
    fecha: '28/07/2026 18:05',
    usuario: 'Marco Damián',
    modulo: 'Productos',
    accion: 'Eliminar variante',
    tipo: 'eliminacion',
    descripcion: 'Eliminó una variante sin movimientos asociados.',
  },
])

const moduleOptions = [
  { label: 'Todos los módulos', value: 'todos' },
  { label: 'Autenticación', value: 'Autenticación' },
  { label: 'Ventas', value: 'Ventas' },
  { label: 'Productos', value: 'Productos' },
  { label: 'Inventario', value: 'Inventario' },
  { label: 'Caja', value: 'Caja' },
  { label: 'Usuarios', value: 'Usuarios' },
]

const filteredRecords = computed(() => {
  const term = normalizeSearch(search.value)

  return records.value.filter((record) => {
    const moduleMatches = moduleFilter.value === 'todos' || record.modulo === moduleFilter.value

    const searchMatches =
      !term ||
      [record.usuario, record.modulo, record.accion, record.descripcion].some((value) =>
        normalizeSearch(value).includes(term),
      )

    return moduleMatches && searchMatches
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / pageSize)))

const paginatedRecords = computed(() => {
  const validPage = Math.min(page.value, totalPages.value)
  const start = (validPage - 1) * pageSize
  return filteredRecords.value.slice(start, start + pageSize)
})

function typeConfig(type: BitacoraTipo) {
  const configs = {
    creacion: { status: 'success' as const, label: 'Creación' },
    edicion: { status: 'info' as const, label: 'Edición' },
    eliminacion: { status: 'danger' as const, label: 'Eliminación' },
    acceso: { status: 'neutral' as const, label: 'Acceso' },
    operacion: { status: 'warning' as const, label: 'Operación' },
  }

  return configs[type]
}

function openDetail(item: BitacoraItem) {
  selectedItem.value = item
  detailOpen.value = true
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Bitácora' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Bitácora</h1>
      <p class="mt-1 text-sm text-gray-500">
        Consulta las acciones relevantes realizadas por los usuarios.
      </p>
    </div>

    <div class="mb-5 flex flex-col gap-3 lg:flex-row">
      <div class="w-full max-w-xl">
        <SearchBar v-model="search" placeholder="Buscar usuario, módulo, acción o descripción..." />
      </div>

      <div class="w-full lg:w-64">
        <BaseSelect
          v-model="moduleFilter"
          :options="moduleOptions"
          placeholder="Filtrar módulo"
          @update:model-value="page = 1"
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Usuario</th>
              <th class="px-5 py-4">Módulo</th>
              <th class="px-5 py-4">Acción</th>
              <th class="px-5 py-4">Tipo</th>
              <th class="px-5 py-4">Descripción</th>
              <th class="px-5 py-4 text-right">Detalle</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="record in paginatedRecords" :key="record.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">{{ record.fecha }}</td>
              <td class="px-5 py-4 font-medium text-gray-900">{{ record.usuario }}</td>
              <td class="px-5 py-4 text-gray-600">{{ record.modulo }}</td>
              <td class="px-5 py-4 text-gray-600">{{ record.accion }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="typeConfig(record.tipo).status"
                  :label="typeConfig(record.tipo).label"
                />
              </td>
              <td class="max-w-sm px-5 py-4 text-gray-600">
                <p class="truncate">{{ record.descripcion }}</p>
              </td>
              <td class="px-5 py-4 text-right">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-400 hover:bg-[#FBEFF3] hover:text-[#C56B86]"
                  aria-label="Ver detalle"
                  @click="openDetail(record)"
                >
                  <EyeIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t border-gray-100 px-5 py-4">
        <BasePagination :page="page" :total-pages="totalPages" @change="page = $event" />
      </div>
    </div>

    <BaseModal
      :open="detailOpen"
      title="Detalle de bitácora"
      max-width="md"
      @close="detailOpen = false"
    >
      <dl v-if="selectedItem" class="space-y-4">
        <div>
          <dt class="text-xs font-medium uppercase text-gray-400">Fecha</dt>
          <dd class="mt-1 text-sm font-medium text-gray-900">{{ selectedItem.fecha }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase text-gray-400">Usuario</dt>
          <dd class="mt-1 text-sm font-medium text-gray-900">{{ selectedItem.usuario }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase text-gray-400">Módulo / Acción</dt>
          <dd class="mt-1 text-sm font-medium text-gray-900">
            {{ selectedItem.modulo }} · {{ selectedItem.accion }}
          </dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase text-gray-400">Descripción</dt>
          <dd class="mt-2 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
            {{ selectedItem.descripcion }}
          </dd>
        </div>
      </dl>
    </BaseModal>
  </section>
</template>
