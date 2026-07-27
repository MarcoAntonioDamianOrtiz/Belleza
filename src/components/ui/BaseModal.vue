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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      @click.self="emit('close')"
    >
      <div
        :class="[
          'max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-xl',
          widths[maxWidth],
        ]"
        role="dialog"
        aria-modal="true"
      >
        <header
          class="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5"
        >
          <h2 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h2>

          <button
            type="button"
            class="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
            aria-label="Cerrar"
            @click="emit('close')"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </header>

        <div class="p-6">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
