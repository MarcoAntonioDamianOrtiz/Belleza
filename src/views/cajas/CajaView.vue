<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  ClockIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

import AbrirCaja from './AbrirCaja.vue'
import CerrarCaja from './CerrarCaja.vue'

import { formatCurrency } from '@/utils/formatCurrency'
import { createMockId } from '@/utils/helpers'

import type { AperturaCajaData } from './AbrirCaja.vue'
import type { CierreCajaData } from './CerrarCaja.vue'
import type { MovimientoCaja, SesionCaja } from '@/types/caja'

const openModal = ref(false)
const closeModal = ref(false)

const session = ref<SesionCaja | null>({
  id: 1,
  estado: 'abierta',
  fechaApertura: '30/07/2026 08:30',
  usuario: 'Administrador',
  montoInicial: 500,
  efectivoEsperado: 1725.5,
})

const movements = ref<MovimientoCaja[]>([
  {
    id: 1,
    fecha: '30/07/2026 09:45',
    tipo: 'venta',
    concepto: 'Venta V-0001',
    metodoPago: 'Efectivo',
    monto: 197.2,
  },
  {
    id: 2,
    fecha: '30/07/2026 10:10',
    tipo: 'venta',
    concepto: 'Venta V-0002',
    metodoPago: 'Tarjeta',
    monto: 425,
  },
  {
    id: 3,
    fecha: '30/07/2026 11:20',
    tipo: 'salida',
    concepto: 'Compra de material',
    metodoPago: 'Efectivo',
    monto: -80,
  },
])

const totalSales = computed(() =>
  movements.value
    .filter((movement) => movement.tipo === 'venta')
    .reduce((total, movement) => total + movement.monto, 0),
)

const cashSales = computed(() =>
  movements.value
    .filter((movement) => movement.tipo === 'venta' && movement.metodoPago === 'Efectivo')
    .reduce((total, movement) => total + movement.monto, 0),
)

const cardSales = computed(() =>
  movements.value
    .filter((movement) => movement.tipo === 'venta' && movement.metodoPago === 'Tarjeta')
    .reduce((total, movement) => total + movement.monto, 0),
)

function saveOpening(data: AperturaCajaData) {
  session.value = {
    id: createMockId(),
    estado: 'abierta',
    fechaApertura: new Date().toLocaleString('es-MX'),
    usuario: 'Administrador',
    montoInicial: data.montoInicial,
    efectivoEsperado: data.montoInicial,
    observaciones: data.observaciones,
  }

  movements.value = []
  openModal.value = false
}

function saveClosing(data: CierreCajaData) {
  if (!session.value) return

  session.value = {
    ...session.value,
    estado: 'cerrada',
    fechaCierre: new Date().toLocaleString('es-MX'),
    efectivoContado: data.efectivoContado,
    diferencia: data.efectivoContado - session.value.efectivoEsperado,
    observaciones: data.observaciones,
  }

  closeModal.value = false
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Caja' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Caja</h1>
        <p class="mt-1 text-sm text-gray-500">
          Controla la apertura, el corte y el cierre de caja.
        </p>
      </div>

      <BaseButton v-if="!session || session.estado === 'cerrada'" @click="openModal = true">
        <LockOpenIcon class="h-5 w-5" />
        Abrir caja
      </BaseButton>

      <BaseButton v-else variant="danger" @click="closeModal = true">
        <LockClosedIcon class="h-5 w-5" />
        Cerrar caja
      </BaseButton>
    </div>

    <div class="mb-6 rounded-2xl border border-[#ECECEC] bg-white p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBEFF3]">
            <BanknotesIcon class="h-6 w-6 text-[#C56B86]" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-semibold text-gray-900">Estado actual</h2>
              <StatusChip
                :status="session?.estado === 'abierta' ? 'success' : 'neutral'"
                :label="session?.estado === 'abierta' ? 'Caja abierta' : 'Caja cerrada'"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">
              {{
                session?.estado === 'abierta'
                  ? `Abierta por ${session.usuario} el ${session.fechaApertura}`
                  : 'No hay una sesión de caja activa.'
              }}
            </p>
          </div>
        </div>

        <div v-if="session?.estado === 'abierta'" class="text-left sm:text-right">
          <p class="text-xs font-medium uppercase text-gray-400">Efectivo esperado</p>
          <p class="mt-1 text-xl font-semibold text-gray-900">
            {{ formatCurrency(session.efectivoEsperado) }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <ClockIcon class="h-5 w-5 text-[#C56B86]" />
        <p class="mt-4 text-sm text-gray-500">Monto inicial</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900">
          {{ formatCurrency(session?.montoInicial ?? 0) }}
        </p>
      </div>

      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <ArrowUpIcon class="h-5 w-5 text-green-600" />
        <p class="mt-4 text-sm text-gray-500">Ventas totales</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900">
          {{ formatCurrency(totalSales) }}
        </p>
      </div>

      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <BanknotesIcon class="h-5 w-5 text-[#C56B86]" />
        <p class="mt-4 text-sm text-gray-500">Ventas en efectivo</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900">
          {{ formatCurrency(cashSales) }}
        </p>
      </div>

      <div class="rounded-2xl border border-[#ECECEC] bg-white p-5">
        <ArrowDownIcon class="h-5 w-5 text-blue-600" />
        <p class="mt-4 text-sm text-gray-500">Ventas con tarjeta</p>
        <p class="mt-2 text-2xl font-semibold text-gray-900">
          {{ formatCurrency(cardSales) }}
        </p>
      </div>
    </div>

    <div class="mt-6 overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
      <div class="border-b border-gray-100 px-5 py-4">
        <h2 class="font-semibold text-gray-900">Movimientos de la sesión</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr class="text-xs font-semibold uppercase text-gray-500">
              <th class="px-5 py-4">Fecha</th>
              <th class="px-5 py-4">Concepto</th>
              <th class="px-5 py-4">Tipo</th>
              <th class="px-5 py-4">Método</th>
              <th class="px-5 py-4 text-right">Monto</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="movement in movements" :key="movement.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-5 py-4 text-gray-600">{{ movement.fecha }}</td>
              <td class="px-5 py-4 font-medium text-gray-900">{{ movement.concepto }}</td>
              <td class="px-5 py-4">
                <StatusChip
                  :status="
                    movement.tipo === 'venta'
                      ? 'success'
                      : movement.tipo === 'salida'
                        ? 'danger'
                        : 'info'
                  "
                  :label="
                    movement.tipo === 'venta'
                      ? 'Venta'
                      : movement.tipo === 'salida'
                        ? 'Salida'
                        : 'Entrada'
                  "
                />
              </td>
              <td class="px-5 py-4 text-gray-600">{{ movement.metodoPago }}</td>
              <td
                :class="[
                  'px-5 py-4 text-right font-semibold',
                  movement.monto < 0 ? 'text-red-600' : 'text-gray-900',
                ]"
              >
                {{ formatCurrency(movement.monto) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal :open="openModal" title="Abrir caja" max-width="md" @close="openModal = false">
      <AbrirCaja @submit="saveOpening" @cancel="openModal = false" />
    </BaseModal>

    <BaseModal :open="closeModal" title="Cerrar caja" max-width="md" @close="closeModal = false">
      <CerrarCaja
        :efectivo-esperado="session?.efectivoEsperado ?? 0"
        @submit="saveClosing"
        @cancel="closeModal = false"
      />
    </BaseModal>
  </section>
</template>
