<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  page: number
  totalPages: number
}

defineProps<Props>()

const emit = defineEmits<{
  change: [page: number]
}>()
</script>

<template>
  <nav class="flex items-center justify-between gap-4" aria-label="Paginación">
    <p class="text-sm text-gray-500">Página {{ page }} de {{ Math.max(totalPages, 1) }}</p>

    <div class="flex items-center gap-2">
      <button
        type="button"
        :disabled="page <= 1"
        class="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
        @click="emit('change', page - 1)"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>

      <button
        type="button"
        :disabled="page >= totalPages"
        class="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
        @click="emit('change', page + 1)"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
    </div>
  </nav>
</template>
