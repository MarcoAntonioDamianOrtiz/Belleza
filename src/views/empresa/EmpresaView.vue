<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  BuildingStorefrontIcon,
  PrinterIcon,
  ReceiptPercentIcon,
  TicketIcon,
} from '@heroicons/vue/24/outline'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'

import { useEmpresaStore } from '@/stores/empresa'

import type { EmpresaConfig } from '@/types/empresa'

type SettingsTab = 'empresa' | 'ticket' | 'politicas' | 'impresora'

const companyStore = useEmpresaStore()
const activeTab = ref<SettingsTab>('empresa')
const savedMessage = ref('')
const logoPreview = ref(companyStore.config.logoUrl ?? '')

const form = reactive<EmpresaConfig>({
  ...companyStore.config,
})

const tabs = [
  { value: 'empresa' as const, label: 'Empresa', icon: BuildingStorefrontIcon },
  { value: 'ticket' as const, label: 'Ticket', icon: TicketIcon },
  { value: 'politicas' as const, label: 'Impuestos y políticas', icon: ReceiptPercentIcon },
  { value: 'impresora' as const, label: 'Impresora', icon: PrinterIcon },
]

function handleLogo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (logoPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreview.value)
  }

  logoPreview.value = URL.createObjectURL(file)
  form.logoUrl = logoPreview.value
}

function saveSettings() {
  if (!form.nombre.trim()) return

  companyStore.actualizar({
    ...form,
    nombre: form.nombre.trim(),
    rfc: form.rfc.trim(),
    direccion: form.direccion.trim(),
    telefono: form.telefono.trim(),
    correo: form.correo.trim(),
    mensajeTicket: form.mensajeTicket.trim(),
    nombreImpresora: form.nombreImpresora.trim(),
    iva: Number(form.iva),
    diasDevolucion: Number(form.diasDevolucion),
  })

  savedMessage.value = 'Configuración guardada temporalmente en el frontend.'

  window.setTimeout(() => {
    savedMessage.value = ''
  }, 3500)
}
</script>

<template>
  <section>
    <AppBreadcrumb :items="[{ label: 'Configuración' }]" />

    <div class="mt-4 mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Configuración</h1>
      <p class="mt-1 text-sm text-gray-500">
        Administra la información del negocio, ticket y políticas.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
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
            <p class="mt-1 text-sm text-gray-500">
              Datos que se mostrarán en el sistema y en los tickets.
            </p>
          </div>

          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50"
            >
              <img
                v-if="logoPreview"
                :src="logoPreview"
                alt="Vista previa del logo"
                class="h-full w-full object-contain"
              />

              <span v-else class="text-2xl font-semibold text-[#C56B86]">B</span>
            </div>

            <div>
              <label
                class="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Seleccionar logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  class="hidden"
                  @change="handleLogo"
                />
              </label>

              <p class="mt-2 text-xs text-gray-500">
                El logo es opcional y puede agregarse al final.
              </p>
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput
              v-model="form.nombre"
              label="Nombre del negocio"
              placeholder="Belleza"
              required
            />

            <BaseInput v-model="form.rfc" label="RFC" placeholder="RFC del negocio" />

            <BaseInput
              v-model="form.telefono"
              type="tel"
              label="Teléfono"
              placeholder="246 000 0000"
            />

            <BaseInput
              v-model="form.correo"
              type="email"
              label="Correo electrónico"
              placeholder="contacto@negocio.com"
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
              placeholder="Dirección completa del negocio"
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />
          </div>
        </div>

        <div v-else-if="activeTab === 'ticket'" class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Personalización del ticket</h2>
            <p class="mt-1 text-sm text-gray-500">
              Define el mensaje que se mostrará al final del comprobante.
            </p>
          </div>

          <div>
            <label for="mensaje-ticket" class="mb-2 block text-sm font-medium text-gray-700">
              Mensaje del ticket
            </label>

            <textarea
              id="mensaje-ticket"
              v-model="form.mensajeTicket"
              rows="5"
              placeholder="Gracias por su compra."
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
            />
          </div>

          <div class="rounded-2xl bg-gray-50 p-5">
            <p class="text-xs font-medium uppercase text-gray-400">Vista previa</p>
            <div class="mx-auto mt-4 max-w-xs bg-white p-5 text-center text-sm shadow-sm">
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
            <p class="mt-1 text-sm text-gray-500">
              Valores usados para mostrar cálculos y políticas en la interfaz.
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <BaseInput v-model="form.iva" type="number" min="0" max="100" step="0.01" required>
              <template #label>
                <span>IVA (%)</span>
                <HelpTooltip
                  text="Porcentaje mostrado en la vista previa de las ventas. El backend validará el cálculo definitivo."
                />
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
            <p class="mt-1 text-sm text-gray-500">
              Configuración visual para la impresora ESC/POS.
            </p>
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

            <span>
              <span class="block text-sm font-medium text-gray-900">
                Imprimir automáticamente
              </span>
              <span class="mt-0.5 block text-xs text-gray-500">
                Inicia la impresión después de completar una venta.
              </span>
            </span>
          </label>

          <p class="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-700">
            La conexión física con la impresora se integrará cuando se defina el mecanismo de
            impresión del equipo.
          </p>
        </div>

        <div
          class="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-green-600">{{ savedMessage }}</p>

          <BaseButton type="submit"> Guardar configuración </BaseButton>
        </div>
      </form>
    </div>
  </section>
</template>
