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
      class="fixed inset-0 z-50 overflow-hidden bg-black/30 p-2 sm:p-6 lg:p-8"
      @click.self="emit('close')"
    >
      <div class="flex h-full min-h-0 items-start justify-center sm:items-center">
        <div
          :class="[
            'flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl lg:max-h-[calc(100dvh-4rem)]',
            widths[maxWidth],
          ]"
          role="dialog"
          aria-modal="true"
        >
          <header
            class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6 sm:py-5"
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

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [-webkit-overflow-scrolling:touch] sm:p-6">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
