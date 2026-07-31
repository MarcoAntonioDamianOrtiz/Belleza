<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import {
  BanknotesIcon,
  ClockIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import StatusChip from '@/components/common/StatusChip.vue'

import {
  abrirCaja,
  cerrarCaja,
  createCaja,
  getCajas,
  getCorteActivo,
  getHistorialCortes,
} from '@/api/cajas'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { Caja, CorteCaja } from '@/types/caja'

type ModalMode = 'crear' | 'abrir' | 'cerrar'

const cajas = ref<Caja[]>([])
const corteActivo = ref<CorteCaja | null>(null)
const historial = ref<CorteCaja[]>([])
const selectedCaja = ref<Caja | null>(null)
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const modalMode = ref<ModalMode>('crear')

const form = reactive({
  nombre: '',
  efectivo: 0,
})

const modalTitle = computed(() => {
  if (modalMode.value === 'crear') return 'Nueva caja'
  if (modalMode.value === 'abrir') return 'Abrir caja'
  return 'Cerrar caja'
})

async function loadData() {
  loading.value = true

  try {
    cajas.value = await getCajas()

    try {
      corteActivo.value = await getCorteActivo()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        corteActivo.value = null
      } else {
        throw error
      }
    }

    if (selectedCaja.value) {
      historial.value = await getHistorialCortes(selectedCaja.value.id)
    }
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar la información de caja.'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  selectedCaja.value = null
  form.nombre = ''
  modalMode.value = 'crear'
  modalOpen.value = true
}

function openBox(caja: Caja) {
  selectedCaja.value = caja
  form.efectivo = 0
  modalMode.value = 'abrir'
  modalOpen.value = true
}

function closeBox(caja: Caja) {
  selectedCaja.value = caja
  form.efectivo = 0
  modalMode.value = 'cerrar'
  modalOpen.value = true
}

async function viewHistory(caja: Caja) {
  selectedCaja.value = caja
  loading.value = true

  try {
    historial.value = await getHistorialCortes(caja.id)
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible cargar el historial.'))
  } finally {
    loading.value = false
  }
}

async function submitModal() {
  saving.value = true

  try {
    if (modalMode.value === 'crear') {
      if (!form.nombre.trim()) return
      await createCaja(form.nombre.trim())
      await showSuccess('Caja creada correctamente.')
    }

    if (modalMode.value === 'abrir' && selectedCaja.value) {
      const response = await abrirCaja({
        caja_id: selectedCaja.value.id,
        efectivo_inicial: Number(form.efectivo),
      })
      await showSuccess(response.message ?? 'Caja abierta correctamente.')
    }

    if (modalMode.value === 'cerrar' && selectedCaja.value) {
      const response = await cerrarCaja({
        caja_id: selectedCaja.value.id,
        efectivo_final: Number(form.efectivo),
      })

      await showSuccess(
        `${response.message ?? 'Caja cerrada correctamente.'} Diferencia: ${formatCurrency(response.data.diferencia)}.`,
      )
    }

    modalOpen.value = false
    await loadData()
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible completar la operación.'))
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Caja' }]" />

    <div class="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Caja</h1>
        <p class="mt-1 text-sm text-gray-500">Abre, cierra y consulta los turnos de caja.</p>
      </div>

      <BaseButton @click="openCreate">
        <PlusIcon class="h-4 w-4" />
        Nueva caja
      </BaseButton>
    </div>

    <BaseLoader v-if="loading" text="Cargando cajas..." />

    <div v-else>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="caja in cajas"
          :key="caja.id"
          class="rounded-2xl border border-[#ECECEC] bg-white p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF3]">
              <BanknotesIcon class="h-6 w-6 text-[#C56B86]" />
            </div>

            <StatusChip
              :status="caja.estado === 'ABIERTA' ? 'success' : 'neutral'"
              :label="caja.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'"
            />
          </div>

          <h2 class="mt-4 font-semibold text-gray-900">{{ caja.nombre }}</h2>
          <p class="mt-1 text-sm text-gray-500">
            {{ caja.activa ? 'Disponible' : 'Inactiva' }}
          </p>

          <div class="mt-5 flex flex-wrap gap-2">
            <BaseButton
              v-if="caja.estado === 'CERRADA'"
              :disabled="!caja.activa"
              @click="openBox(caja)"
            >
              <LockOpenIcon class="h-4 w-4" />
              Abrir
            </BaseButton>

            <BaseButton v-else variant="danger" @click="closeBox(caja)">
              <LockClosedIcon class="h-4 w-4" />
              Cerrar
            </BaseButton>

            <BaseButton variant="secondary" @click="viewHistory(caja)">
              <ClockIcon class="h-4 w-4" />
              Historial
            </BaseButton>
          </div>
        </article>

        <div
          v-if="!cajas.length"
          class="rounded-2xl border border-[#ECECEC] bg-white p-10 text-center text-gray-500"
        >
          No hay cajas registradas.
        </div>
      </div>

      <div v-if="corteActivo" class="mt-6 rounded-2xl border border-[#ECECEC] bg-white p-5">
        <h2 class="font-semibold text-gray-900">Corte abierto</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p class="text-xs uppercase text-gray-400">Fecha de apertura</p>
            <p class="mt-1 text-sm font-medium text-gray-900">
              {{ formatDate(corteActivo.fechaInicio) }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase text-gray-400">Efectivo inicial</p>
            <p class="mt-1 text-sm font-medium text-gray-900">
              {{ formatCurrency(corteActivo.efectivoInicial) }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase text-gray-400">Estado</p>
            <p class="mt-1 text-sm font-medium text-green-600">Abierto</p>
          </div>
        </div>
      </div>

      <div
        v-if="selectedCaja"
        class="mt-6 overflow-hidden rounded-2xl border border-[#ECECEC] bg-white"
      >
        <div class="border-b border-gray-100 px-5 py-4">
          <h2 class="font-semibold text-gray-900">Historial de {{ selectedCaja.nombre }}</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr class="text-xs font-semibold uppercase text-gray-500">
                <th class="px-5 py-4">Apertura</th>
                <th class="px-5 py-4">Cierre</th>
                <th class="px-5 py-4">Inicial</th>
                <th class="px-5 py-4">Final</th>
                <th class="px-5 py-4">Diferencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in historial" :key="item.id">
                <td class="px-5 py-4 text-gray-600">
                  {{ formatDate(item.fechaInicio) }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.fechaFin ? formatDate(item.fechaFin) : 'Abierto' }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ formatCurrency(item.efectivoInicial) }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.efectivoFinal === null ? '—' : formatCurrency(item.efectivoFinal) }}
                </td>
                <td class="px-5 py-4 font-medium text-gray-900">
                  {{ item.diferencia === null ? '—' : formatCurrency(item.diferencia) }}
                </td>
              </tr>

              <tr v-if="!historial.length">
                <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                  No hay cortes registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <BaseModal :open="modalOpen" :title="modalTitle" max-width="md" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="submitModal">
        <BaseInput
          v-if="modalMode === 'crear'"
          v-model="form.nombre"
          label="Nombre de la caja"
          placeholder="Ej. Caja principal"
          required
        />

        <BaseInput
          v-else
          v-model="form.efectivo"
          type="number"
          min="0"
          step="0.01"
          :label="modalMode === 'abrir' ? 'Efectivo inicial' : 'Efectivo contado'"
          required
        />

        <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <BaseButton variant="secondary" @click="modalOpen = false"> Cancelar </BaseButton>
          <BaseButton type="submit" :loading="saving"> Confirmar </BaseButton>
        </div>
      </form>
    </BaseModal>
  </section>
</template>
