<script setup lang="ts">
import { ref } from 'vue'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'

interface Props {
  text: string
}

defineProps<Props>()

const open = ref(false)
</script>

<template>
  <span
    class="relative inline-flex"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @focusin="open = true"
    @focusout="open = false"
  >
    <button
      type="button"
      class="inline-flex items-center text-gray-400 transition hover:text-[#C56B86] focus:text-[#C56B86] focus:outline-none"
      aria-label="Mostrar ayuda"
      :aria-expanded="open"
      @click="open = !open"
    >
      <QuestionMarkCircleIcon class="h-4 w-4" />
    </button>

    <span
      v-if="open"
      role="tooltip"
      class="absolute top-full left-0 z-50 mt-2 w-max max-w-[min(16rem,calc(100vw-3rem))] rounded-lg bg-gray-900 px-3 py-2 text-xs leading-5 font-normal text-white shadow-lg"
    >
      {{ text }}

      <span class="absolute bottom-full left-2 border-4 border-transparent border-b-gray-900" />
    </span>
  </span>
</template>
