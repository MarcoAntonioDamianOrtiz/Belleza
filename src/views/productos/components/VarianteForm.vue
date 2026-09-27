<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { CameraIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { BrowserMultiFormatReader } from '@zxing/browser'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import type { Variante } from '@/types/variante'

interface Props {
  variante?: Variante | null
}

const props = withDefaults(defineProps<Props>(), {
  variante: null,
})

export interface VarianteFormData {
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  stockMinimo: number
  garantiaMeses: number | null
}

const emit = defineEmits<{
  submit: [data: VarianteFormData]
  cancel: []
}>()

interface VarianteFormState {
  nombre: string
  sku: string
  codigoBarras: string
  costo: number
  precioMenudeo: number
  precioMayoreo: number
  stock: number
  stockMinimo: number
  garantiaMeses: number | null | ''
}

const formError = ref('')
const scannerOpen = ref(false)
const scannerError = ref('')
const scannerMessage = ref('')
const videoElement = ref<HTMLVideoElement | null>(null)

const barcodeReader = new BrowserMultiFormatReader(undefined, {
  delayBetweenScanAttempts: 100,
})

let scannerControls: { stop: () => void } | null = null
let scannerSession = 0

const form = reactive<VarianteFormState>({
  nombre: props.variante?.nombre ?? '',
  sku: props.variante?.sku ?? '',
  codigoBarras: props.variante?.codigoBarras ?? '',
  costo: props.variante?.costo ?? 0,
  precioMenudeo: props.variante?.precioMenudeo ?? 0,
  precioMayoreo: props.variante?.precioMayoreo ?? 0,
  stock: props.variante?.stock ?? 0,
  stockMinimo: props.variante?.stockMinimo ?? 0,
  garantiaMeses: props.variante?.garantiaMeses ?? null,
})

function stopScanner() {
  scannerSession += 1
  scannerControls?.stop()
  scannerControls = null

  const video = videoElement.value
  const stream = video?.srcObject
  if (stream instanceof MediaStream) {
    stream.getTracks().forEach((track) => track.stop())
  }
  if (video) video.srcObject = null

  scannerOpen.value = false
}

async function startScanner() {
  if (scannerOpen.value) return

  scannerError.value = ''
  scannerMessage.value = ''
  scannerOpen.value = true
  const session = ++scannerSession

  await nextTick()
  if (!videoElement.value || session !== scannerSession) return

  try {
    const controls = await barcodeReader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      videoElement.value,
      (result) => {
        if (!result || session !== scannerSession) return

        const code = result.getText().trim()
        if (!/^\d{1,100}$/.test(code)) {
          scannerError.value = 'El código detectado debe contener solo números (máximo 100).'
          return
        }

        form.codigoBarras = code
        formError.value = ''
        scannerMessage.value = 'Código capturado. Revísalo antes de guardar.'
        stopScanner()
      },
    )

    if (session !== scannerSession) {
      controls.stop()
      return
    }
    scannerControls = controls
  } catch {
    if (session === scannerSession) {
      scannerError.value = 'No se pudo abrir la cámara. Revisa el permiso y usa HTTPS o localhost.'
    }
  }
}

function cancelForm() {
  stopScanner()
  emit('cancel')
}

onBeforeUnmount(stopScanner)

function submitForm() {
  formError.value = ''

  if (!form.nombre.trim() || !form.sku.trim() || !form.codigoBarras.trim()) {
    formError.value = 'Completa los campos obligatorios.'
    return
  }

  if (!/^\d{1,100}$/.test(form.codigoBarras.trim())) {
    formError.value = 'El código de barras solo puede contener números (máximo 100).'
    return
  }

  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(form.sku.trim())) {
    formError.value = 'El SKU solo admite letras, números, guion y guion bajo (máximo 100).'
    return
  }

  if (form.nombre.trim().length > 150) {
    formError.value = 'La variante no puede superar 150 caracteres.'
    return
  }

  const costo = Number(form.costo)
  const precioMenudeo = Number(form.precioMenudeo)
  const precioMayoreo = Number(form.precioMayoreo)
  const stock = Number(form.stock)
  const stockMinimo = Number(form.stockMinimo)
  const garantiaMeses =
    form.garantiaMeses === null || form.garantiaMeses === ''
      ? null
      : Number(form.garantiaMeses)

  if (
    [costo, precioMenudeo, precioMayoreo].some((value) => !Number.isFinite(value) || value < 0)
  ) {
    formError.value = 'Los precios y el costo deben ser números iguales o mayores a cero.'
    return
  }

  if (garantiaMeses !== null && (!Number.isInteger(garantiaMeses) || garantiaMeses < 0)) {
    formError.value = 'La garantía debe ser un número entero igual o mayor a cero.'
    return
  }

  if (precioMenudeo < costo) {
    formError.value = 'El precio de menudeo no puede ser menor al costo.'
    return
  }

  if (precioMayoreo < costo) {
    formError.value = 'El precio de mayoreo no puede ser menor al costo.'
    return
  }

  if (!Number.isInteger(stock) || stock < 0) {
    formError.value = 'El stock inicial debe ser un número entero igual o mayor a cero.'
    return
  }

  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
    formError.value = 'El stock mínimo debe ser un número entero igual o mayor a cero.'
    return
  }

  stopScanner()
  emit('submit', {
    nombre: form.nombre.trim(),
    sku: form.sku.trim().toUpperCase(),
    codigoBarras: form.codigoBarras.trim(),
    costo,
    precioMenudeo,
    precioMayoreo,
    stock,
    stockMinimo,
    garantiaMeses,
  })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="grid gap-5 md:grid-cols-2">
      <BaseInput v-model="form.nombre" label="Variante" placeholder="Ej. Rojo Cereza" required />

      <BaseInput v-model="form.sku" label="SKU" placeholder="Ej. LAB-MAT-ROJ" required />

      <div class="space-y-2">
        <div class="flex items-end gap-2">
          <BaseInput
            v-model="form.codigoBarras"
            id="variante-codigo-barras"
            label="Código de barras"
            placeholder="7501234567890"
            inputmode="numeric"
            autocomplete="off"
            required
          />
          <button
            type="button"
            class="flex h-[42px] shrink-0 items-center gap-2 rounded-xl border border-[#C56B86] px-3 text-sm font-medium text-[#C56B86] transition hover:bg-[#C56B86]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C56B86]"
            aria-label="Escanear código de barras con la cámara"
            @click="startScanner"
          >
            <CameraIcon class="h-5 w-5" aria-hidden="true" />
            <span class="hidden sm:inline">Escanear</span>
          </button>
        </div>
        <p v-if="scannerMessage" role="status" class="text-xs text-green-700">
          {{ scannerMessage }}
        </p>
      </div>

      <BaseInput v-model="form.costo" label="Costo" type="number" min="0" step="0.01" required />

      <BaseInput
        v-model="form.precioMenudeo"
        label="Precio menudeo"
        type="number"
        min="0"
        step="0.01"
        required
      />

      <BaseInput
        v-model="form.precioMayoreo"
        label="Precio mayoreo"
        type="number"
        min="0"
        step="0.01"
        required
      />

      <BaseInput
        v-model="form.stock"
        :label="variante ? 'Stock actual' : 'Stock inicial'"
        type="number"
        min="0"
        :disabled="Boolean(variante)"
        required
      />

      <BaseInput v-model="form.stockMinimo" label="Stock mínimo" type="number" min="0" required />

      <BaseInput
        v-model="form.garantiaMeses"
        label="Garantía (meses)"
        type="number"
        min="0"
        placeholder="Sin garantía"
      />
    </div>

    <p v-if="variante" class="text-xs text-gray-500">
      Para modificar existencias, utiliza el módulo de Inventario.
    </p>

    <p class="text-xs text-gray-500">Si no cuenta con garantía, deja el campo vacío.</p>

    <p v-if="formError" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
      {{ formError }}
    </p>

    <div class="mobile-action-row flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
      <BaseButton variant="secondary" @click="cancelForm"> Cancelar </BaseButton>

      <BaseButton type="submit">
        {{ variante ? 'Guardar cambios' : 'Agregar variante' }}
      </BaseButton>
    </div>
  </form>

  <Teleport to="body">
    <div
      v-if="scannerOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Escáner de código de barras"
      @click.self="stopScanner"
    >
      <div class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center justify-between px-4 py-3">
          <p class="font-medium text-gray-900">Apunta al código de barras</p>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar escáner"
            @click="stopScanner"
          >
            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <video ref="videoElement" autoplay muted playsinline class="aspect-video w-full bg-black object-cover" />
        <p v-if="scannerError" role="alert" class="px-4 py-3 text-sm text-red-600">
          {{ scannerError }}
        </p>
        <p v-else class="px-4 py-3 text-sm text-gray-600">
          El código se colocará en el formulario al detectarlo.
        </p>
      </div>
    </div>
  </Teleport>
</template>
