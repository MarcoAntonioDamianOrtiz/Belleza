<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import {
  BuildingStorefrontIcon,
  PrinterIcon,
  ReceiptPercentIcon,
  TicketIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseLoader from '@/components/ui/BaseLoader.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'

import { createEmpresa, getEmpresa, updateEmpresa } from '@/api/empresa'
import { getFriendlyError } from '@/utils/apiError'
import { showError, showSuccess } from '@/utils/notifications'

import type { EmpresaPayload } from '@/types/empresa'

type SettingsTab = 'empresa' | 'ticket' | 'politicas' | 'impresora'

const activeTab = ref<SettingsTab>('empresa')
const loading = ref(false)
const saving = ref(false)
const exists = ref(false)

const form = reactive({
  nombre: '',
  rfc: '',
  direccion: '',
  telefono: '',
  logo: '',
  mensajeTicket: 'Gracias por su compra.',
  iva: 16,
  diasDevolucion: 15,
  nombreImpresora: localStorage.getItem('printer_name') ?? '',
  impresionAutomatica: localStorage.getItem('printer_auto') === 'true',
})

const tabs = [
  {
    value: 'empresa' as const,
    label: 'Empresa',
    icon: BuildingStorefrontIcon,
  },
  { value: 'ticket' as const, label: 'Ticket', icon: TicketIcon },
  {
    value: 'politicas' as const,
    label: 'Impuestos y políticas',
    icon: ReceiptPercentIcon,
  },
  { value: 'impresora' as const, label: 'Impresora', icon: PrinterIcon },
]

function assignCompany(data: Awaited<ReturnType<typeof getEmpresa>>) {
  form.nombre = data.nombre
  form.rfc = data.rfc
  form.direccion = data.direccion
  form.telefono = data.telefono
  form.logo = data.logo
  form.mensajeTicket = data.mensajeTicket
  form.iva = data.iva
  form.diasDevolucion = data.diasDevolucion
}

async function loadCompany() {
  loading.value = true

  try {
    const data = await getEmpresa()
    assignCompany(data)
    exists.value = true
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      exists.value = false
      return
    }

    await showError(getFriendlyError(error, 'No fue posible cargar la configuración.'))
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  if (!form.nombre.trim() || !form.direccion.trim()) return

  saving.value = true

  try {
    const payload: EmpresaPayload = {
      nombre: form.nombre.trim(),
      rfc: form.rfc.trim() || null,
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim() || null,
      logo: form.logo.trim() || null,
      mensaje_ticket: form.mensajeTicket.trim(),
      iva: Number(form.iva),
      dias_devolucion: Number(form.diasDevolucion),
    }

    const result = exists.value ? await updateEmpresa(payload) : await createEmpresa(payload)

    assignCompany(result)
    exists.value = true

    localStorage.setItem('printer_name', form.nombreImpresora.trim())
    localStorage.setItem('printer_auto', String(form.impresionAutomatica))

    await showSuccess('Configuración guardada correctamente.')
  } catch (error) {
    await showError(getFriendlyError(error, 'No fue posible guardar la configuración.'))
  } finally {
    saving.value = false
  }
}

onMounted(loadCompany)
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Configuración' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Configuración</h1>
      <p class="mt-1 text-sm text-gray-500">
        Administra la información del negocio y sus políticas.
      </p>
    </div>

    <BaseLoader v-if="loading" text="Cargando configuración..." />

    <div v-else class="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
      <aside class="h-fit rounded-2xl border border-[#ECECEC] bg-white p-3">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition',
            activeTab === tab.value
              ? 'bg-[#FBEFF3] text-[#C56B86]'
              : 'text-gray-600 hover:bg-gray-50',
          ]"
          @click="activeTab = tab.value"
        >
          <component :is="tab.icon" class="h-5 w-5" />
          {{ tab.label }}
        </button>
      </aside>

      <form class="rounded-2xl border border-[#ECECEC] bg-white p-6" @submit.prevent="saveSettings">
        <div v-if="activeTab === 'empresa'" class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Información del negocio</h2>
            <p class="mt-1 text-sm text-gray-500">Datos que aparecerán en los tickets.</p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput v-model="form.nombre" label="Nombre del negocio" required />
            <BaseInput v-model="form.rfc" label="RFC" />
            <BaseInput v-model="form.telefono" type="tel" label="Teléfono" />
            <BaseInput
              v-model="form.logo"
              label="Logo (dirección web opcional)"
              placeholder="https://..."
            />
          </div>

          <div>
            <label for="empresa-direccion" class="mb-2 block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <textarea
              id="empresa-direccion"
              v-model="form.direccion"
              rows="3"
              required
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />
          </div>
        </div>

        <div v-else-if="activeTab === 'ticket'" class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Personalización del ticket</h2>
          </div>

          <div>
            <label for="mensaje-ticket" class="mb-2 block text-sm font-medium text-gray-700">
              Mensaje del ticket
            </label>
            <textarea
              id="mensaje-ticket"
              v-model="form.mensajeTicket"
              rows="5"
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />
          </div>

          <div class="rounded-2xl bg-gray-50 p-5">
            <div class="mx-auto max-w-xs bg-white p-5 text-center text-sm shadow-sm">
              <p class="font-semibold">{{ form.nombre || 'Belleza' }}</p>
              <p class="mt-4 border-t border-dashed border-gray-300 pt-4 text-xs text-gray-500">
                {{ form.mensajeTicket || 'Sin mensaje configurado.' }}
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'politicas'" class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Impuestos y políticas</h2>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput v-model="form.iva" type="number" min="0" max="100" step="0.01" required>
              <template #label>
                <span>IVA (%)</span>
                <HelpTooltip text="Porcentaje aplicado al registrar una venta." />
              </template>
            </BaseInput>

            <BaseInput
              v-model="form.diasDevolucion"
              type="number"
              min="0"
              label="Días permitidos para devolución"
              required
            />
          </div>
        </div>

        <div v-else class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Impresora de tickets</h2>
          </div>

          <BaseInput
            v-model="form.nombreImpresora"
            label="Nombre de la impresora"
            placeholder="Ej. POS-80"
          />

          <label
            class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4"
          >
            <input
              v-model="form.impresionAutomatica"
              type="checkbox"
              class="h-4 w-4 accent-[#C56B86]"
            />
            <span class="text-sm font-medium text-gray-900">
              Imprimir automáticamente después de una venta
            </span>
          </label>
        </div>

        <div class="mt-8 flex justify-end border-t border-gray-100 pt-5">
          <BaseButton type="submit" :loading="saving"> Guardar configuración </BaseButton>
        </div>
      </form>
    </div>
  </section>
</template>
