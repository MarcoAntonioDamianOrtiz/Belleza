<script setup lang="ts">
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

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

const editing = ref(false)

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return target.matches(
    'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]',
  )
}

function syncEditingState(event: FocusEvent) {
  editing.value = isEditableTarget(event.target)
}

function handleFocusOut() {
  window.setTimeout(() => {
    editing.value = isEditableTarget(document.activeElement)
  }, 0)
}

function dismissKeyboard() {
  const activeElement = document.activeElement

  if (activeElement instanceof HTMLElement) {
    activeElement.blur()
  }

  editing.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 overflow-hidden bg-black/30 p-2 sm:p-5 xl:p-8"
      @click.self="emit('close')"
    >
      <div class="flex h-full min-h-0 items-start justify-center sm:items-center">
        <div
          :class="[
            'flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl xl:max-h-[calc(100dvh-4rem)]',
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

            <div class="flex items-center gap-1">
              <button
                v-if="editing"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#B55F79] transition hover:bg-[#FFF5F8] xl:hidden"
                aria-label="Ocultar teclado"
                @pointerdown.prevent="dismissKeyboard"
                @click="dismissKeyboard"
              >
                <CheckIcon class="h-4 w-4" />
                Listo
              </button>

              <button
                type="button"
                class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
                aria-label="Cerrar"
                @click="emit('close')"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </header>

          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [-webkit-overflow-scrolling:touch] sm:p-6"
            @focusin="syncEditingState"
            @focusout="handleFocusOut"
          >
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
