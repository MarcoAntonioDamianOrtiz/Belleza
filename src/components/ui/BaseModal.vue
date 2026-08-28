<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
  title: string
  maxWidth?: 'md' | 'lg' | 'xl'
}

withDefaults(defineProps<Props>(), {
  maxWidth: 'lg',
})

const emit = defineEmits<{
  close: []
}>()

const widths = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/30 px-4 py-4 sm:px-6 sm:py-8"
      @click.self="emit('close')"
    >
      <div class="flex min-h-full items-start justify-center sm:items-center">
        <div
          :class="[
            'my-auto w-full overflow-visible rounded-2xl bg-white shadow-xl',
            widths[maxWidth],
          ]"
          role="dialog"
          aria-modal="true"
        >
          <header
            class="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5"
          >
            <h2 class="text-base font-semibold text-gray-900 sm:text-lg">
              {{ title }}
            </h2>

            <button
              type="button"
              class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
              aria-label="Cerrar"
              @click="emit('close')"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </header>

          <div class="p-5 sm:p-6">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
