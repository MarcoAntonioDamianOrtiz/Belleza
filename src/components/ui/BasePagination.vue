<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  page: number
  totalPages: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  change: [page: number]
}>()

type PageItem = number | 'ellipsis-left' | 'ellipsis-right'

const normalizedTotalPages = computed(() => Math.max(props.totalPages, 1))

const visiblePages = computed<PageItem[]>(() => {
  const total = normalizedTotalPages.value
  const current = Math.min(Math.max(props.page, 1), total)

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', total]
  }

  if (current >= total - 3) {
    return [1, 'ellipsis-left', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, 'ellipsis-left', current - 1, current, current + 1, 'ellipsis-right', total]
})

function goToPage(targetPage: number) {
  const safePage = Math.min(Math.max(targetPage, 1), normalizedTotalPages.value)

  if (safePage !== props.page) {
    emit('change', safePage)
  }
}
</script>

<template>
  <nav
    class="mt-4 flex flex-col gap-3 rounded-2xl border border-[#E8D9DE] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    aria-label="Paginación"
  >
    <div class="flex items-center justify-between gap-3 sm:justify-start">
      <p class="text-sm font-medium text-gray-700">
        Página
        <span class="font-bold text-gray-950">{{ page }}</span>
        de
        <span class="font-bold text-gray-950">{{ normalizedTotalPages }}</span>
      </p>

    </div>

    <div class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-1.5">
      <button
        type="button"
        :disabled="page <= 1"
        class="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-2 text-gray-700 shadow-sm transition hover:border-[#C96886] hover:bg-[#FFF4F7] hover:text-[#B65373] focus:outline-none focus:ring-2 focus:ring-[#E9AFC1] focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none"
        aria-label="Página anterior"
        title="Página anterior"
        @click="goToPage(page - 1)"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>

      <span
        class="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-[#E8D9DE] bg-[#FFF7F9] px-3 text-sm font-semibold text-[#A94D6B] sm:hidden"
      >
        {{ page }} / {{ normalizedTotalPages }}
      </span>

      <div class="hidden items-center gap-1.5 sm:flex">
        <template v-for="item in visiblePages" :key="item">
          <span
            v-if="typeof item !== 'number'"
            class="inline-flex h-10 min-w-7 items-center justify-center px-1 text-sm font-semibold text-gray-400"
            aria-hidden="true"
          >
            …
          </span>

          <button
            v-else
            type="button"
            class="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#E9AFC1] focus:ring-offset-2"
            :class="
              item === page
                ? 'border-[#C96886] bg-[#C96886] text-white shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#C96886] hover:bg-[#FFF4F7] hover:text-[#B65373]'
            "
            :aria-current="item === page ? 'page' : undefined"
            :aria-label="`Ir a la página ${item}`"
            @click="goToPage(item)"
          >
            {{ item }}
          </button>
        </template>
      </div>

      <button
        type="button"
        :disabled="page >= normalizedTotalPages"
        class="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-gray-300 bg-white px-2 text-gray-700 shadow-sm transition hover:border-[#C96886] hover:bg-[#FFF4F7] hover:text-[#B65373] focus:outline-none focus:ring-2 focus:ring-[#E9AFC1] focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none"
        aria-label="Página siguiente"
        title="Página siguiente"
        @click="goToPage(page + 1)"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </button>
    </div>
  </nav>
</template>
