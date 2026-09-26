<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { MicrophoneIcon, StopIcon } from '@heroicons/vue/24/outline'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'

interface Props {
  producto?: Producto | null
  categorias: Categoria[]
}

const props = withDefaults(defineProps<Props>(), {
  producto: null,
})

export interface ProductoFormData {
  nombre: string
  categoriaId: string
  descripcion: string
}

const emit = defineEmits<{
  submit: [data: ProductoFormData]
  cancel: []
}>()

const form = reactive<ProductoFormData>({
  nombre: props.producto?.nombre ?? '',
  categoriaId: props.producto?.categoriaId ?? '',
  descripcion: props.producto?.descripcion ?? '',
})

const options = computed(() =>
  props.categorias
    .filter((item) => item.activo || item.id === props.producto?.categoriaId)
    .map((item) => ({
      label: item.activo ? item.nombre : `${item.nombre} (inactiva)`,
      value: item.id,
    })),
)

type CampoDictado = 'nombre' | 'descripcion'

interface VoiceResultEvent {
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >
}

interface VoiceRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: VoiceResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}

type VoiceConstructor = new () => VoiceRecognition

const campoActivo = ref<CampoDictado | null>(null)

const mensajesVoz = reactive<Record<CampoDictado, string>>({
  nombre: '',
  descripcion: '',
})

const erroresVoz = reactive<Record<CampoDictado, boolean>>({
  nombre: false,
  descripcion: false,
})

let reconocimiento: VoiceRecognition | null = null

function detenerDictado() {
  const actual = reconocimiento
  reconocimiento = null

  if (actual) {
    actual.onresult = null
    actual.onerror = null
    actual.onend = null
    actual.abort()
  }

  campoActivo.value = null
}

function dictar(campo: CampoDictado) {
  // Pulsar de nuevo el mismo botón detiene el dictado.
  if (campoActivo.value === campo) {
    detenerDictado()
    mensajesVoz[campo] = 'Dictado detenido.'
    erroresVoz[campo] = false
    return
  }

  // Solo puede estar activo un micrófono a la vez.
  if (campoActivo.value) {
    const anterior = campoActivo.value
    detenerDictado()
    mensajesVoz[anterior] = 'Dictado detenido.'
    erroresVoz[anterior] = false
  }

  mensajesVoz[campo] = ''
  erroresVoz[campo] = false

  const navegador = window as unknown as {
    SpeechRecognition?: VoiceConstructor
    webkitSpeechRecognition?: VoiceConstructor
  }

  const Constructor =
    navegador.SpeechRecognition ?? navegador.webkitSpeechRecognition

  if (!Constructor) {
    erroresVoz[campo] = true
    mensajesVoz[campo] =
      'Este navegador no admite dictado. Puedes escribir manualmente.'
    return
  }

  const actual = new Constructor()
  reconocimiento = actual
  let textoCapturado = false

  actual.lang = 'es-MX'
  actual.continuous = false
  actual.interimResults = false

  actual.onresult = (event) => {
    if (reconocimiento !== actual) return

    const resultado = event.results[0]
    const texto = resultado?.[0]?.transcript.trim()

    if (resultado?.isFinal && texto) {
      form[campo] = texto
      textoCapturado = true
      erroresVoz[campo] = false
      mensajesVoz[campo] = 'Texto capturado. Revísalo antes de guardar.'
    }
  }

  actual.onerror = (event) => {
    if (reconocimiento !== actual) return

    const mensajes: Record<string, string> = {
      'not-allowed': 'Permite el acceso al micrófono en el navegador.',
      'service-not-allowed':
        'El navegador no permite el servicio de dictado.',
      'audio-capture': 'No se encontró un micrófono disponible.',
      'no-speech': 'No se detectó voz. Intenta nuevamente.',
      network: 'Falló la conexión del dictado. Revisa tu conexión.',
      'language-not-supported':
        'El servicio de dictado no admite el idioma seleccionado.',
    }

    erroresVoz[campo] = true
    mensajesVoz[campo] =
      mensajes[event.error] ?? 'No se pudo completar el dictado.'
  }

  actual.onend = () => {
    if (reconocimiento !== actual) return

    reconocimiento = null
    campoActivo.value = null

    if (!textoCapturado && !erroresVoz[campo]) {
      mensajesVoz[campo] = 'No se capturó texto. Intenta nuevamente.'
    }
  }

  try {
    campoActivo.value = campo
    mensajesVoz[campo] =
      campo === 'nombre'
        ? 'Escuchando… Di el nombre del producto.'
        : 'Escuchando… Di la descripción del producto.'

    actual.start()
  } catch {
    detenerDictado()
    erroresVoz[campo] = true
    mensajesVoz[campo] = 'No se pudo iniciar el micrófono.'
  }
}

function cancelarFormulario() {
  detenerDictado()
  emit('cancel')
}

function submitForm() {
  if (!form.nombre.trim() || !form.categoriaId) return

  detenerDictado()
  mensajesVoz.nombre = ''
  mensajesVoz.descripcion = ''

  emit('submit', {
    nombre: form.nombre.trim(),
    categoriaId: form.categoriaId,
    descripcion: form.descripcion.trim(),
  })
}

onBeforeUnmount(detenerDictado)
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="space-y-2">
      <BaseInput
        v-model="form.nombre"
        label="Nombre del producto"
        placeholder="Ej. Labial rosa fresa"
        required
      />

      <button
        type="button"
        :aria-pressed="campoActivo === 'nombre'"
        class="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C56B86] focus-visible:ring-offset-2"
        :class="
          campoActivo === 'nombre'
            ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-[#C56B86] text-[#C56B86] hover:bg-[#C56B86]/10'
        "
        @click="dictar('nombre')"
      >
        <StopIcon
          v-if="campoActivo === 'nombre'"
          class="h-5 w-5"
          aria-hidden="true"
        />
        <MicrophoneIcon v-else class="h-5 w-5" aria-hidden="true" />

        {{ campoActivo === 'nombre' ? 'Detener dictado' : 'Dictar nombre' }}
      </button>

      <p
        v-if="mensajesVoz.nombre"
        role="status"
        aria-live="polite"
        class="text-sm"
        :class="erroresVoz.nombre ? 'text-red-600' : 'text-gray-600'"
      >
        {{ mensajesVoz.nombre }}
      </p>
    </div>

    <BaseSelect
      v-model="form.categoriaId"
      label="Categoría"
      :options="options"
      placeholder="Selecciona una categoría"
      required
    />

    <div class="space-y-2">
      <label
        for="producto-descripcion"
        class="block text-sm font-medium text-gray-700"
      >
        Descripción
      </label>

      <textarea
        id="producto-descripcion"
        v-model="form.descripcion"
        rows="4"
        placeholder="Descripción opcional del producto"
        class="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#C56B86] focus:ring-2 focus:ring-[#C56B86]/15"
      />

      <button
        type="button"
        :aria-pressed="campoActivo === 'descripcion'"
        class="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C56B86] focus-visible:ring-offset-2"
        :class="
          campoActivo === 'descripcion'
            ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-[#C56B86] text-[#C56B86] hover:bg-[#C56B86]/10'
        "
        @click="dictar('descripcion')"
      >
        <StopIcon
          v-if="campoActivo === 'descripcion'"
          class="h-5 w-5"
          aria-hidden="true"
        />
        <MicrophoneIcon v-else class="h-5 w-5" aria-hidden="true" />

        {{
          campoActivo === 'descripcion'
            ? 'Detener dictado'
            : 'Dictar descripción'
        }}
      </button>

      <p
        v-if="mensajesVoz.descripcion"
        role="status"
        aria-live="polite"
        class="text-sm"
        :class="erroresVoz.descripcion ? 'text-red-600' : 'text-gray-600'"
      >
        {{ mensajesVoz.descripcion }}
      </p>
    </div>

    <p class="text-xs text-gray-500">
      El dictado reemplaza el texto del campo seleccionado.
      Puedes corregirlo antes de guardar.
    </p>

    <div
      class="mobile-action-row flex justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row"
    >
      <BaseButton
        type="button"
        variant="secondary"
        @click="cancelarFormulario"
      >
        Cancelar
      </BaseButton>

      <BaseButton type="submit">
        {{ producto ? 'Guardar cambios' : 'Crear producto' }}
      </BaseButton>
    </div>
  </form>
</template>