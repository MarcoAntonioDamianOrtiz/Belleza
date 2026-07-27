<script setup lang="ts">
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Confirmar acción',
  description: '¿Deseas continuar con esta acción?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      @click.self="emit('cancel')"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-500" />
          </div>

          <button
            type="button"
            class="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Cerrar"
            @click="emit('cancel')"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <h2 class="mt-5 text-lg font-semibold text-gray-900">
          {{ title }}
        </h2>

        <p class="mt-2 text-sm leading-6 text-gray-500">
          {{ description }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <BaseButton variant="secondary" @click="emit('cancel')">
            {{ cancelText }}
          </BaseButton>

          <BaseButton variant="danger" :loading="loading" @click="emit('confirm')">
            {{ confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
